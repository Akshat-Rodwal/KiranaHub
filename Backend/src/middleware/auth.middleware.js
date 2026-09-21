import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

export const verifyJWT = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Authentication required. Please log in to continue.'
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Your session has expired. Please log in again.'
        );
      }
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Invalid authentication token. Please log in again.'
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'User account no longer exists.'
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Your account has been deactivated. Please contact support.'
      );
    }

    req.user = user.toSafeUser();
    req.userId = user._id;

    next();
  } catch (err) {
    next(err);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          httpStatus.UNAUTHORIZED,
          'Authentication required to perform this action.'
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          `Access denied: '${req.user.role}' role is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
