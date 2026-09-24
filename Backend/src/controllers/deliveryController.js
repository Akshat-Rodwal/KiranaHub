import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import Order from '../models/Order.js';
import { emitOrderStatusUpdate, emitRiderMoved } from '../socket.js';

/**
 * GET /api/v1/delivery/orders
 * Returns active order feed for delivery partner app
 */
export const getActiveDeliveryOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({
    orderStatus: { $in: ['CONFIRMED', 'PREPARING', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('user', 'name phone email')
    .lean();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Active delivery orders retrieved', {
      count: orders.length,
      orders,
    }),
  );
});

/**
 * POST /api/v1/delivery/accept/:orderId
 * Delivery partner accepts an order for fulfillment
 */
export const acceptDeliveryOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { riderName, riderPhone, coords } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  order.deliveryBoy = {
    name: riderName || order.deliveryBoy?.name || 'Vikram Singh',
    phone: riderPhone || order.deliveryBoy?.phone || '+91 98765 43210',
    currentCoords: coords || order.deliveryBoy?.currentCoords || { lat: 28.6328, lng: 77.2167 },
  };

  if (order.orderStatus === 'CONFIRMED') {
    order.orderStatus = 'PREPARING';
  }

  await order.save();

  emitOrderStatusUpdate(order._id, {
    status: order.orderStatus,
    deliveryBoy: order.deliveryBoy,
  });

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Order accepted by delivery partner', order),
  );
});

/**
 * POST /api/v1/delivery/status/:orderId
 * Updates delivery milestone step (PICKED_UP, OUT_FOR_DELIVERY, DELIVERED)
 */
export const updateDeliveryStep = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, otp } = req.body;

  const validStatuses = ['CONFIRMED', 'PREPARING', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid delivery step: ${status}`);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // If marking delivered and OTP was submitted, verify it
  if (status === 'DELIVERED' && order.deliveryOtp && otp) {
    if (order.deliveryOtp.trim() !== otp.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Delivery OTP provided by customer');
    }
  }

  order.orderStatus = status;
  if (status === 'DELIVERED') {
    order.paymentStatus = 'PAID';
  }

  await order.save();

  emitOrderStatusUpdate(order._id, {
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    deliveryBoy: order.deliveryBoy,
  });

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, `Order status updated to ${status}`, order),
  );
});

/**
 * POST /api/v1/delivery/location/:orderId
 * Streams GPS coordinates from delivery partner device
 */
export const updateDeliveryLocation = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { coords } = req.body;

  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Valid lat/lng coords required');
  }

  await Order.findByIdAndUpdate(orderId, {
    'deliveryBoy.currentCoords': {
      lat: Number(coords.lat),
      lng: Number(coords.lng),
    },
  });

  emitRiderMoved(orderId, coords);

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Location broadcasted successfully', { orderId, coords }),
  );
});

export default {
  getActiveDeliveryOrders,
  acceptDeliveryOrder,
  updateDeliveryStep,
  updateDeliveryLocation,
};
