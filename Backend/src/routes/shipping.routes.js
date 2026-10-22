import express from 'express';
import {
  generateShippingLabelHandler,
  getShippingLabelHandler,
} from '../controllers/shippingController.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(authorizeRoles('admin', 'manager'));

router.post('/orders/:id/generate-shipping-label', generateShippingLabelHandler);
router.get('/orders/:id/shipping-label', getShippingLabelHandler);

export default router;
