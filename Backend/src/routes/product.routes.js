import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  validateProductQuery,
  validateProductSlugParam,
  validateProductCreate,
  validateProductUpdate,
} from '../validators/product.validator.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Read Routes
router.get('/', validateProductQuery, getProducts);
router.get('/:slug', validateProductSlugParam, getProductBySlug);
router.get('/:slug/related', validateProductSlugParam, getRelatedProducts);

// Protected Admin/Manager Write Routes
router.post(
  '/',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateProductCreate,
  createProduct,
);

router.put(
  '/:slug',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateProductSlugParam,
  validateProductUpdate,
  updateProduct,
);

router.delete(
  '/:slug',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateProductSlugParam,
  deleteProduct,
);

export default router;
