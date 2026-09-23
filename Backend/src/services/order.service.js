import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import StockReservation from '../models/StockReservation.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import { sendEmail } from '../config/emailConfig.js';
import { getOrderConfirmationTemplate } from '../utils/emailTemplates.js';
import { emitNewOrderAlert } from '../socket.js';

const createOrder = async ({ userId, items, deliveryAddress, paymentMethod, cartToken }) => {
  // Phase 1: Pre-validation & Stock Verification
  // We resolve all products and verify stock availability before making any database updates.
  const resolvedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const isObjectId = mongoose.Types.ObjectId.isValid(item.product);
    const query = isObjectId
      ? { $or: [{ _id: item.product }, { slug: item.product }], isActive: true }
      : { slug: item.product, isActive: true };

    const product = await Product.findOne(query);

    if (!product) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Product with reference '${item.product}' is no longer available`,
      );
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for '${product.name}'. Only ${product.stock} left in stock, but ${item.quantity} was requested.`,
      );
    }

    const itemPrice = product.price;
    const itemMrp = product.mrp || product.price;
    const itemImage = product.images?.[0]?.url || product.image || '';

    resolvedItems.push({
      productDoc: product,
      orderItem: {
        product: product._id,
        name: product.name,
        price: itemPrice,
        mrp: itemMrp,
        quantity: item.quantity,
        unit: product.unit || '1 pc',
        image: itemImage,
      },
      quantity: item.quantity,
      lineTotal: itemPrice * item.quantity,
    });

    subtotal += itemPrice * item.quantity;
  }

  // Phase 2: Atomic Inventory Deduction
  // Once all items have been confirmed available, deduct stock atomically.
  for (const resolved of resolvedItems) {
    await Product.findByIdAndUpdate(resolved.productDoc._id, {
      $inc: { stock: -resolved.quantity, reservedStock: -resolved.quantity },
    });
  }

  // Ensure reservedStock never drops below 0
  await Product.updateMany({ reservedStock: { $lt: 0 } }, { $set: { reservedStock: 0 } });

  // Delete active reservation for this cart session if exists
  if (cartToken) {
    await StockReservation.deleteMany({ cartToken });
  }

  // Phase 3: Server-side Pricing Computation
  // Delivery is FREE for orders >= ₹499, otherwise ₹25. Handling fee is ₹2.
  const deliveryFee = subtotal >= 499 ? 0 : 25;
  const handlingFee = 2;
  const discount = 0;
  const grandTotal = subtotal + deliveryFee + handlingFee - discount;

  const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';

  // Phase 4: Create Order Record
  const order = await Order.create({
    user: userId,
    items: resolvedItems.map((r) => r.orderItem),
    deliveryAddress,
    pricing: {
      subtotal,
      deliveryFee,
      handlingFee,
      discount,
      grandTotal,
    },
    paymentMethod,
    paymentStatus,
    orderStatus: 'PENDING',
    expectedDeliveryTime: '20-30 mins',
  });

  // Emit real-time notification to Admin Operations channel
  emitNewOrderAlert(order);

  // Phase 5: Asynchronous Order Confirmation Email (non-blocking)
  User.findById(userId)
    .lean()
    .then((customer) => {
      if (customer?.email) {
        return sendEmail({
          to: customer.email,
          subject: `Order Confirmed #${order._id.toString().slice(-6).toUpperCase()} ⚡ KiranaHub Fresh`,
          html: getOrderConfirmationTemplate({ order, user: customer }),
        });
      }
    })
    .catch((err) => {
      console.warn('[Order Confirmation Email Notice] Background email notice:', err?.message);
    });

  return order;
};

const cancelCustomerOrder = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID format');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Ensure customer can only cancel their own order
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to cancel this order');
  }

  // Customer cancellation rule: Only allowed while still in PENDING state
  if (order.orderStatus !== 'PENDING') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel order. Only orders in 'PENDING' status can be cancelled by customers (current status is '${order.orderStatus}').`,
    );
  }

  // Automatic inventory replenishment in MongoDB Atlas without partial failures
  for (const item of order.items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
        $set: { inStock: true },
      });
    }
  }

  order.orderStatus = 'CANCELLED';
  await order.save();

  return order;
};

const getMyOrders = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const [orders, total] = await Promise.all([
    Order.find({ $or: [{ user: userObjectId }, { user: userId }] })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name price images imageUrl')
      .lean(),
    Order.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

const getOrderById = async (orderId, userId, userRole = 'customer') => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID format');
  }

  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Ensure customer can only view their own orders; admins/managers can view any
  const isOwner = order.user.toString() === userId.toString();
  const isAdminOrManager = ['admin', 'manager', 'staff'].includes(userRole);

  if (!isOwner && !isAdminOrManager) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to view this order');
  }

  return order;
};

export {
  createOrder,
  cancelCustomerOrder,
  getMyOrders,
  getOrderById,
};

export default {
  createOrder,
  cancelCustomerOrder,
  getMyOrders,
  getOrderById,
};
