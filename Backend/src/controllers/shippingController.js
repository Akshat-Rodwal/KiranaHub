import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import { generateShippingLabel } from '../services/shipping.service.js';

export const generateShippingLabelHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const label = await generateShippingLabel(id);

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Shipping label generated successfully', label));
});

export const getShippingLabelHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const label = await generateShippingLabel(id);

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Shipping label retrieved successfully', label));
});

export default {
  generateShippingLabelHandler,
  getShippingLabelHandler,
};
