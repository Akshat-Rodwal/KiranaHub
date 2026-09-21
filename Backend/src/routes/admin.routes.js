import express from 'express';
import {
  getOverviewAnalytics,
  getAdminOrders,
  updateOrderStatus,
  updateProductStock,
} from '../controllers/adminController.js';
import {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import {
  getPublicSettings,
  updateStoreSettings,
} from '../controllers/settingsController.js';
import {
  validateObjectIdParam,
  validateUpdateOrderStatus,
  validateUpdateProductStock,
  validateAdminOrdersQuery,
} from '../validators/admin.validator.js';
import { uploadBanner } from '../middleware/upload.middleware.js';
import { handleImageUpload } from '../controllers/uploadController.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication & admin/manager role authorization globally across all admin routes
router.use(verifyJWT, authorizeRoles('admin', 'manager'));

// Overview Analytics
router.get('/analytics/overview', getOverviewAnalytics);
router.get('/dashboard/stats', getOverviewAnalytics);
router.get('/stats', getOverviewAnalytics);

// Orders Management
router.get('/orders', validateAdminOrdersQuery, getAdminOrders);
router.patch('/orders/:id/status', validateObjectIdParam('id'), validateUpdateOrderStatus, updateOrderStatus);

// Inventory Stock Quick Updater
router.patch('/products/:id/stock', validateObjectIdParam('id'), validateUpdateProductStock, updateProductStock);

// Store Settings & Announcements
router.get('/settings', getPublicSettings);
router.patch('/settings', updateStoreSettings);

// Banners & Promotional Media Management
router.get('/banners', getAdminBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', validateObjectIdParam('id'), updateBanner);
router.delete('/banners/:id', validateObjectIdParam('id'), deleteBanner);

// Direct File Upload Support (Multipart Form-Data)
router.post('/upload', uploadBanner.single('image'), handleImageUpload);
router.post('/banners/upload', uploadBanner.single('image'), handleImageUpload);

export default router;
