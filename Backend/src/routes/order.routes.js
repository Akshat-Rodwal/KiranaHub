import express from 'express';
import {
  createOrder,
  cancelCustomerOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { getAdminOrders } from '../controllers/adminController.js';
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

export default router;
