import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Webhook endpoint (public, validated via HMAC signature)
router.post('/webhook', handleWebhook);

// Protected customer payment endpoints
router.post('/create-order', verifyJWT, createRazorpayOrder);
router.post('/verify', verifyJWT, verifyPayment);

export default router;
