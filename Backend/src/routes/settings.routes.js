import express from 'express';
import {
  getPublicSettings,
  updateStoreSettings,
} from '../controllers/settingsController.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public store settings & announcement query
router.get('/', getPublicSettings);

// Admin-protected settings updates
router.get('/admin', verifyJWT, authorizeRoles('admin', 'manager'), getPublicSettings);
router.patch('/admin', verifyJWT, authorizeRoles('admin', 'manager'), updateStoreSettings);

export default router;
