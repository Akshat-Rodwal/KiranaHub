import ApiError from './ApiError.js';
import httpStatus from '../constants/httpStatus.js';

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      if (err instanceof ApiError) {
        next(err);
      } else if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        }));
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            'Validation failed',
            errors,
            err.stack
          )
        );
      } else if (err.name === 'CastError') {
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Invalid ${err.path}: ${err.value}`,
            [],
            err.stack
          )
        );
      } else if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        next(
          new ApiError(
            httpStatus.CONFLICT,
            `Duplicate value for: ${field}`,
            [],
            err.stack
          )
        );
      } else if (err.name === 'JsonWebTokenError') {
        next(
          new ApiError(
            httpStatus.UNAUTHORIZED,
            'Invalid token. Please log in again.',
            [],
            err.stack
          )
        );
      } else if (err.name === 'TokenExpiredError') {
        next(
          new ApiError(
            httpStatus.UNAUTHORIZED,
            'Token expired. Please log in again.',
            [],
            err.stack
          )
        );
      } else {
        next(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            err.message || 'Internal Server Error',
            [],
            err.stack
          )
        );
      }
    });
  };
};

export default asyncHandler;
