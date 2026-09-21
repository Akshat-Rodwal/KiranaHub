import validate from './validate.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import { USER_ROLES } from '../constants/index.js';

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^(?:(?:\+91|91)[6-9]\d{9}|[6-9]\d{9})$/;

export const validateRegister = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', required: true, min: 2, max: 80, label: 'Full Name' },
      email: {
        type: 'string',
        required: true,
        pattern: emailPattern,
        patternMessage: 'Please provide a valid email address',
        label: 'Email',
      },
      phone: {
        type: 'string',
        required: true,
        pattern: phonePattern,
        patternMessage: 'Please provide a valid 10-digit mobile number',
        label: 'Phone number',
      },
      password: {
        type: 'string',
        required: true,
        min: 6,
        max: 128,
        label: 'Password',
      },
      role: {
        type: 'string',
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.CUSTOMER,
      },
    });

    // Normalize phone to standard 10 digits
    let cleanPhone = req.validatedBody.phone.replace(/\s+/g, '').replace(/^\+91/, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }
    req.validatedBody.phone = cleanPhone.trim();
    req.validatedBody.email = req.validatedBody.email.toLowerCase().trim();

    next();
  } catch (err) {
    next(err);
  }
};

export const validateLogin = (req, _res, next) => {
  try {
    const raw = req.body || {};
    const identifier = (raw.identifier || raw.email || raw.phone || '').trim();
    const password = (raw.password || '').trim();

    if (!identifier) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email or phone number is required');
    }
    if (!password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
    }

    req.validatedBody = {
      identifier,
      password,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const validateRefreshToken = (req, _res, next) => {
  try {
    const token = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
    }
    req.validatedBody = { refreshToken: token.trim() };
    next();
  } catch (err) {
    next(err);
  }
};

export const validateSendRegistrationOtp = (req, _res, next) => {
  try {
    req.validatedBody = validate(req.body, {
      name: { type: 'string', required: true, min: 2, max: 80, label: 'Full Name' },
      email: {
        type: 'string',
        required: true,
        pattern: emailPattern,
        patternMessage: 'Please provide a valid email address',
        label: 'Email',
      },
      phone: {
        type: 'string',
        required: true,
        pattern: phonePattern,
        patternMessage: 'Please provide a valid 10-digit mobile number',
        label: 'Phone number',
      },
      password: {
        type: 'string',
        required: true,
        min: 6,
        max: 128,
        label: 'Password',
      },
      channel: {
        type: 'string',
        enum: ['email', 'sms'],
        default: 'sms',
      },
    });

    let cleanPhone = req.validatedBody.phone.replace(/\s+/g, '').replace(/^\+91/, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }
    req.validatedBody.phone = cleanPhone.trim();
    req.validatedBody.email = req.validatedBody.email.toLowerCase().trim();

    next();
  } catch (err) {
    next(err);
  }
};

export const validateVerifyRegistrationOtp = (req, _res, next) => {
  try {
    const raw = req.body || {};
    const identifier = (raw.identifier || raw.email || raw.phone || '').trim();
    const otp = (raw.otp || '').toString().trim();

    if (!identifier) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email or phone number identifier is required');
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A valid 6-digit numeric OTP is required');
    }

    req.validatedBody = {
      identifier: identifier.toLowerCase(),
      otp,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const validateSendForgotPasswordOtp = (req, _res, next) => {
  try {
    const raw = req.body || {};
    const identifier = (raw.identifier || raw.email || raw.phone || '').trim();
    const channel = raw.channel === 'email' ? 'email' : 'sms';

    if (!identifier) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email or phone number is required');
    }

    req.validatedBody = {
      identifier: identifier.toLowerCase(),
      channel,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const validateVerifyForgotPasswordOtp = (req, _res, next) => {
  try {
    const raw = req.body || {};
    const identifier = (raw.identifier || raw.email || raw.phone || '').trim();
    const otp = (raw.otp || '').toString().trim();

    if (!identifier) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email or phone number is required');
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A valid 6-digit numeric OTP is required');
    }

    req.validatedBody = {
      identifier: identifier.toLowerCase(),
      otp,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const validateResetPassword = (req, _res, next) => {
  try {
    const raw = req.body || {};
    const resetToken = (raw.resetToken || '').trim();
    const newPassword = (raw.newPassword || raw.password || '').trim();

    if (!resetToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password reset token is required');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'New password must be at least 6 characters');
    }

    req.validatedBody = {
      resetToken,
      newPassword,
    };

    next();
  } catch (err) {
    next(err);
  }
};

