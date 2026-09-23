import crypto from 'crypto';
import Razorpay from 'razorpay';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import config from '../config/env.js';
import Order from '../models/Order.js';
import { emitOrderStatusUpdate, emitNewOrderAlert } from '../socket.js';

const getRazorpayInstance = () => {
  if (!config.razorpayKeyId || !config.razorpayKeySecret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Razorpay credentials are not configured in Backend environment.',
    );
  }
  return new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });
};

/**
 * POST /api/v1/payments/create-order
 * Creates a Razorpay Order for a specific KiranaHub customer order
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order ID is required to initiate Razorpay checkout');
  }

  const order = await Order.findById(orderId).populate('user', 'name email phone');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order has already been paid for');
  }

  const grandTotal = order.pricing?.grandTotal || 0;
  const amountInPaise = Math.round(grandTotal * 100);

  if (amountInPaise <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order total for online payment');
  }

  const razorpay = getRazorpayInstance();

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${order._id.toString().slice(-8)}`,
    notes: {
      orderId: order._id.toString(),
      customerName: order.deliveryAddress?.receiverName || order.user?.name || '',
      customerPhone: order.deliveryAddress?.receiverPhone || order.user?.phone || '',
    },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Razorpay order created successfully', {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpayKeyId,
      orderId: order._id,
      customer: {
        name: order.deliveryAddress?.receiverName || order.user?.name || 'Customer',
        email: order.user?.email || 'customer@kiranahub.local',
        phone: order.deliveryAddress?.receiverPhone || order.user?.phone || '9876543210',
      },
    }),
  );
});

/**
 * POST /api/v1/payments/verify
 * Verifies the HMAC SHA256 signature returned by Razorpay client checkout
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing Razorpay signature verification parameters');
  }

  // 1. Verify HMAC SHA256 Signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment signature. Verification failed.');
  }

  // 2. Find and update the order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { razorpayOrderId: razorpay_order_id },
    ],
  }).populate('user', 'name email phone');

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Matching order not found for payment verification');
  }

  order.paymentStatus = 'PAID';
  order.paymentMethod = 'ONLINE';
  order.razorpayOrderId = razorpay_order_id;
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;

  if (order.orderStatus === 'PENDING') {
    order.orderStatus = 'CONFIRMED';
  }

  await order.save();

  // 3. Emit real-time Socket.io notifications
  emitOrderStatusUpdate(order._id, {
    status: order.orderStatus,
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
  });
  emitNewOrderAlert(order);

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Payment verified and order confirmed successfully', order),
  );
});

/**
 * POST /api/v1/payments/webhook
 * Razorpay Webhook Handler for asynchronous capture events
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || config.razorpayKeySecret;

  if (webhookSignature && webhookSecret) {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== webhookSignature) {
      return res.status(httpStatus.BAD_REQUEST).json({ status: 'invalid_signature' });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = payload?.payment?.entity;
    const rzpOrderId = payment?.order_id || payload?.order?.entity?.id;
    const orderId = payment?.notes?.orderId;

    if (rzpOrderId || orderId) {
      const order = await Order.findOne({
        $or: [{ _id: orderId }, { razorpayOrderId: rzpOrderId }],
      });

      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        order.paymentMethod = 'ONLINE';
        order.razorpayPaymentId = payment?.id || order.razorpayPaymentId;
        if (order.orderStatus === 'PENDING') {
          order.orderStatus = 'CONFIRMED';
        }
        await order.save();

        emitOrderStatusUpdate(order._id, {
          status: order.orderStatus,
          paymentStatus: 'PAID',
        });
      }
    }
  }

  return res.status(httpStatus.OK).json({ status: 'ok' });
});

export default {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
};
