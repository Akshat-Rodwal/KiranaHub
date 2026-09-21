import mongoose from 'mongoose';
import validate from './validate.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

export const validateObjectIdParam = (paramName = 'id') => (req, _res, next) => {
  const idValue = req.params[paramName];
  if (!idValue || !mongoose.Types.ObjectId.isValid(idValue)) {
    return next(new ApiError(httpStatus.BAD_REQUEST, `Invalid ${paramName} parameter. Must be a valid 24-character hexadecimal ObjectId.`));
  }
  next();
};

export const validateUpdateOrderStatus = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      orderStatus: {
        type: 'string',
        required: true,
        enum: [
          'PENDING',
          'CONFIRMED',
          'PREPARING',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
        ],
      },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateUpdateProductStock = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      stock: {
        type: 'number',
        required: true,
        integer: true,
        min: 0, // Prevent negative stock
      },
    });
    next();
  } catch (err) {
    next(err);
  }
};

export const validateAdminOrdersQuery = (req, _res, next) => {
  try {
    if (req.query?.status && typeof req.query.status === 'string') {
      req.query.status = req.query.status.trim().toUpperCase();
    }
    req.validatedQuery = validate(req.query, {
      page: { type: 'number', min: 1, integer: true, default: 1 },
      limit: { type: 'number', min: 1, max: 100, integer: true, default: 20 },
      status: {
        type: 'string',
        enum: [
          'ALL',
          'PENDING',
          'CONFIRMED',
          'PREPARING',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
        ],
        default: 'ALL',
      },
      search: { type: 'string', max: 100, default: '' },
    });
    next();
  } catch (err) {
    next(err);
  }
};
