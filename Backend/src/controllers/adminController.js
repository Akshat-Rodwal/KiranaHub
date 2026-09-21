import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Allowed State Transitions (Forward flow & cancellation)
const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Finalized terminal state
  CANCELLED: [], // Finalized terminal state
};

/**
 * GET /api/v1/admin/analytics/overview (or /dashboard/stats)
 * Overview metrics: Today's sales, total orders, pending orders, active orders, low stock, product counts, revenue breakdown
 */
const getOverviewAnalytics = asyncHandler(async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    pendingOrders,
    activeOrdersCount,
    lowStockCount,
    outOfStockCount,
    totalProducts,
    allOrders,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'PENDING' }),
    Order.countDocuments({
      orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] },
    }),
    Product.countDocuments({ stock: { $lt: 10, $gt: 0 } }),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ isActive: { $ne: false } }),
    Order.find().select('pricing paymentMethod paymentStatus createdAt orderStatus').lean(),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images imageUrl')
      .lean(),
  ]);

  let todaySales = 0;
  let todayOrders = 0;
  let totalRevenue = 0;
  const paymentBreakdown = {
    COD: { revenue: 0, count: 0 },
    UPI: { revenue: 0, count: 0 },
    CARD: { revenue: 0, count: 0 },
    WALLET: { revenue: 0, count: 0 },
  };

  allOrders.forEach((order) => {
    const amount = order.pricing?.grandTotal || 0;
    const isPaidOrDelivered = order.orderStatus === 'DELIVERED' || order.paymentStatus === 'PAID';

    // Total revenue is aggregate sum of delivered/paid orders (excluding cancelled)
    if (order.orderStatus !== 'CANCELLED' && isPaidOrDelivered) {
      totalRevenue += amount;
    }

    // Today's orders count and sales (excluding cancelled)
    if (new Date(order.createdAt) >= todayStart && order.orderStatus !== 'CANCELLED') {
      todayOrders += 1;
      todaySales += amount;
    }

    const method = order.paymentMethod || 'COD';
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { revenue: 0, count: 0 };
    }
    if (order.orderStatus !== 'CANCELLED') {
      paymentBreakdown[method].revenue += amount;
      paymentBreakdown[method].count += 1;
    }
  });

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Analytics overview retrieved successfully', {
      todaySales,
      todayOrders,
      totalOrders,
      pendingOrders,
      activeOrders: activeOrdersCount,
      lowStockCount,
      outOfStockCount,
      totalProducts,
      totalRevenue,
      paymentBreakdown,
      recentOrders,
    }),
  );
});

/**
 * GET /api/v1/admin/orders
 * Paginated list of all customer orders with filtering by orderStatus and search
 */
const getAdminOrders = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query || {};
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const rawStatus = (query.status || 'ALL').toString().trim().toUpperCase();
  const search = (query.search || '').toString().trim();
  const skip = (page - 1) * limit;

  const filter = {};

  if (rawStatus && rawStatus !== 'ALL') {
    filter.orderStatus = rawStatus;
  }

  if (search) {
    if (mongoose.Types.ObjectId.isValid(search)) {
      filter._id = search;
    } else {
      filter.$or = [
        { 'deliveryAddress.receiverName': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.receiverPhone': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.city': { $regex: search, $options: 'i' } },
      ];
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images imageUrl')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Admin orders retrieved successfully', {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }),
  );
});

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Updates orderStatus with transition validation and inventory restocking on cancellation
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus: nextStatus } = req.validatedBody;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const currentStatus = order.orderStatus;

  // No-op if same status
  if (currentStatus === nextStatus) {
    return res.status(httpStatus.OK).json(
      new ApiResponse(httpStatus.OK, `Order is already in '${nextStatus}' status`, order),
    );
  }

  // Finalized states cannot be transitioned backwards or modified
  if (currentStatus === 'DELIVERED') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Order is already DELIVERED and cannot be transitioned to any other state.',
    );
  }

  if (currentStatus === 'CANCELLED') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Order is already CANCELLED and cannot be transitioned to any other state.',
    );
  }

  // Validate state transitions
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition order status from '${currentStatus}' to '${nextStatus}'. Allowed transitions: [${allowed.join(', ')}]`,
    );
  }

  // If order is cancelled, return reserved inventory stock
  if (nextStatus === 'CANCELLED') {
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
          $set: { inStock: true },
        });
      }
    }
  }

  // If delivered and paymentMethod is COD, mark paymentStatus as PAID
  if (nextStatus === 'DELIVERED' && order.paymentMethod === 'COD') {
    order.paymentStatus = 'PAID';
  }

  order.orderStatus = nextStatus;
  await order.save();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, `Order status updated to '${nextStatus}'`, order),
  );
});

/**
 * PATCH /api/v1/admin/products/:id/stock
 * Quick inventory updater for inline stock modification
 */
const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stock } = req.validatedBody;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  product.stock = stock;
  product.inStock = stock > 0;
  await product.save();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, `Stock for '${product.name}' updated to ${stock}`, product),
  );
});

const getAllOrders = getAdminOrders;
const getAdminDashboardStats = getOverviewAnalytics;

export {
  getOverviewAnalytics,
  getAdminDashboardStats,
  getAdminOrders,
  getAllOrders,
  updateOrderStatus,
  updateProductStock,
};

export default {
  getOverviewAnalytics,
  getAdminDashboardStats,
  getAdminOrders,
  getAllOrders,
  updateOrderStatus,
  updateProductStock,
};
