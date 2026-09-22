import express from 'express';
import {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

import { uploadBanner } from '../middleware/upload.middleware.js';
import { handleImageUpload } from '../controllers/uploadController.js';

const router = express.Router();

// Public: Get active banners for homepage rendering
router.get('/', getBanners);

// Image Upload Endpoint (dedicated for banners)
router.post('/upload', verifyJWT, authorizeRoles('admin', 'manager'), uploadBanner.single('image'), handleImageUpload);

// Admin / Manager protected banner management
router.get('/admin', verifyJWT, authorizeRoles('admin', 'manager'), getAdminBanners);
router.post('/admin', verifyJWT, authorizeRoles('admin', 'manager'), createBanner);
router.put('/admin/:id', verifyJWT, authorizeRoles('admin', 'manager'), updateBanner);
router.put('/:id', verifyJWT, authorizeRoles('admin', 'manager'), updateBanner);
router.delete('/admin/:id', verifyJWT, authorizeRoles('admin', 'manager'), deleteBanner);
router.delete('/:id', verifyJWT, authorizeRoles('admin', 'manager'), deleteBanner);

export default router;
