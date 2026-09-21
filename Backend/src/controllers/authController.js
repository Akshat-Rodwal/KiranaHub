import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import authService from '../services/auth.service.js';

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validatedBody);

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        'Account registered successfully',
        result
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validatedBody);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Logged in successfully',
        result
      )
    );
});

const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id || req.userId;
  const user = await authService.getMe(userId);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Current user retrieved successfully',
        { user }
      )
    );
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.validatedBody.refreshToken);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Token refreshed successfully',
        result
      )
    );
});

const logout = asyncHandler(async (_req, res) => {
  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Logged out successfully',
        null
      )
    );
});

const googleAuth = asyncHandler(async (req, res) => {
  const credential = req.body?.credential || req.validatedBody?.credential;
  const result = await authService.googleAuth({ credential });

  return res
    .status(result.isNewUser ? httpStatus.CREATED : httpStatus.OK)
    .json(
      new ApiResponse(
        result.isNewUser ? httpStatus.CREATED : httpStatus.OK,
        result.isNewUser ? 'Account registered via Google' : 'Logged in with Google successfully',
        result
      )
    );
});

const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const result = await authService.sendRegistrationOtp(req.validatedBody);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        `Verification code sent via ${result.channel.toUpperCase()}`,
        result
      )
    );
});

const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyRegistrationOtp(req.validatedBody);

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        'Account verified and created successfully',
        result
      )
    );
});

const sendForgotPasswordOtp = asyncHandler(async (req, res) => {
  const result = await authService.sendForgotPasswordOtp(req.validatedBody);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        `Password reset code sent via ${result.channel.toUpperCase()}`,
        result
      )
    );
});

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyForgotPasswordOtp(req.validatedBody);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'OTP verified successfully',
        result
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.validatedBody);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Password updated successfully',
        result
      )
    );
});

export {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  googleAuth,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};

export default {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  googleAuth,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};

