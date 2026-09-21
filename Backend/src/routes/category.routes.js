import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  validateCategoryQuery,
  validateCategorySlugParam,
  validateCategoryCreate,
  validateCategoryUpdate,
} from '../validators/category.validator.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Read Routes
router.get('/', validateCategoryQuery, getCategories);
router.get('/:slug', validateCategorySlugParam, getCategoryBySlug);

// Protected Admin/Manager Write Routes
router.post(
  '/',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateCategoryCreate,
  createCategory,
);

router.put(
  '/:slug',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateCategorySlugParam,
  validateCategoryUpdate,
  updateCategory,
);

router.delete(
  '/:slug',
  verifyJWT,
  authorizeRoles('admin', 'manager'),
  validateCategorySlugParam,
  deleteCategory,
);

export default router;
