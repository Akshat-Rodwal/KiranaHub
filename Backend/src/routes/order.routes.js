import express from 'express';
import {
  createOrder,
  cancelCustomerOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
} from '../controllers/orderController.js';
import { getAdminOrders } from '../controllers/adminController.js';
import {
  requestReturnHandler,
  processRefundHandler,
} from '../controllers/refundController.js';
import {
  generateShippingLabelHandler,
  getShippingLabelHandler,
} from '../controllers/shippingController.js';
import { validateOrderCreate } from '../validators/order.validator.js';
import { validateAdminOrdersQuery } from '../validators/admin.validator.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order operations require authenticated session
router.use(verifyJWT);

router.get('/', authorizeRoles('admin', 'manager'), validateAdminOrdersQuery, getAdminOrders);
router.post('/', validateOrderCreate, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelCustomerOrder);

// Tax Invoice Download (PDF)
router.get('/:id/invoice', downloadInvoice);

// Customer Return Request
router.post('/:id/return-request', requestReturnHandler);

// Admin Process Refund (Razorpay refund API + MongoDB stock restoration)
router.post('/:id/process-refund', authorizeRoles('admin', 'manager'), processRefundHandler);

// Shipping & Logistics Label Generation
router.post(
  '/:id/generate-shipping-label',
  authorizeRoles('admin', 'manager'),
  generateShippingLabelHandler,
);
router.get(
  '/:id/shipping-label',
  authorizeRoles('admin', 'manager'),
  getShippingLabelHandler,
);

export default router;
