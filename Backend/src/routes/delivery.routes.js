import express from 'express';
import {
  getActiveDeliveryOrders,
  acceptDeliveryOrder,
  updateDeliveryStep,
  updateDeliveryLocation,
} from '../controllers/deliveryController.js';

const router = express.Router();

router.get('/orders', getActiveDeliveryOrders);
router.post('/accept/:orderId', acceptDeliveryOrder);
router.post('/status/:orderId', updateDeliveryStep);
router.post('/location/:orderId', updateDeliveryLocation);

export default router;
