import express from 'express';
import {
  reserveStock,
  releaseStock,
  validateCart,
} from '../controllers/cartReservationController.js';

const router = express.Router();

router.post('/validate', validateCart);
router.post('/reserve-stock', reserveStock);
router.post('/release-stock', releaseStock);

export default router;
