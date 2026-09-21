import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import orderService from '../services/order.service.js';

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const order = await orderService.createOrder({
    userId,
    ...req.validatedBody,
  });

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        'Order placed successfully',
        order,
      ),
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await orderService.getMyOrders(userId, { page, limit });

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Order history retrieved successfully',
        result,
      ),
    );
});

const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const userRole = req.user?.role || 'customer';
  const order = await orderService.getOrderById(req.params.id, userId, userRole);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Order details retrieved successfully',
        order,
      ),
    );
});

const cancelCustomerOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const order = await orderService.cancelCustomerOrder(req.params.id, userId);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Order cancelled successfully and stock replenished',
        order,
      ),
    );
});

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
