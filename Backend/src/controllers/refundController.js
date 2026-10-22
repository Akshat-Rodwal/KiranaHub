import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import { requestOrderReturn, processOrderRefund } from '../services/refund.service.js';

export const requestReturnHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, comments, items } = req.body;
  const userId = req.user._id;

  const order = await requestOrderReturn({
    orderId: id,
    userId,
    reason,
    comments,
    items,
  });

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Return request submitted successfully', order));
});

export const processRefundHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, refundMethod, adminNote } = req.body;

  const order = await processOrderRefund({
    orderId: id,
    amount,
    refundMethod,
    adminNote,
  });

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Refund processed and stock restored successfully', order));
});

export default {
  requestReturnHandler,
  processRefundHandler,
};
