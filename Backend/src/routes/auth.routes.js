import express from 'express';
import {
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
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateSendRegistrationOtp,
  validateVerifyRegistrationOtp,
  validateSendForgotPasswordOtp,
  validateVerifyForgotPasswordOtp,
  validateResetPassword,
} from '../validators/auth.validator.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Dual OTP Registration Flows
router.post('/register-otp', validateSendRegistrationOtp, sendRegistrationOtp);
router.post('/verify-registration-otp', validateVerifyRegistrationOtp, verifyRegistrationOtp);

// Dual OTP Forgot Password Flows
router.post('/forgot-password-otp', validateSendForgotPasswordOtp, sendForgotPasswordOtp);
router.post('/verify-forgot-password-otp', validateVerifyForgotPasswordOtp, verifyForgotPasswordOtp);
router.post('/reset-password', validateResetPassword, resetPassword);

// Standard Local & Social Auth Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);
router.get('/me', verifyJWT, getMe);
router.post('/refresh-token', validateRefreshToken, refreshToken);
router.post('/logout', verifyJWT, logout);

export default router;
