import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import categoryService from '../services/category.service.js';

const getCategories = asyncHandler(async (req, res) => {
  const query = req.validatedQuery || req.query || {};
  const includeInactive = query.includeInactive === true || query.includeInactive === 'true' || query.all === 'true';
  const categories = await categoryService.list({ includeInactive });

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Categories retrieved successfully',
        { items: categories, categories },
      ),
    );
});

const getAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.list({ includeInactive: true });

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Admin categories retrieved successfully',
        { items: categories, categories },
      ),
    );
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const slug = req.validatedParams?.slug || req.params?.slug;
  const category = await categoryService.bySlug(slug);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Category retrieved successfully',
        category,
      ),
    );
});

const createCategory = asyncHandler(async (req, res) => {
  const body = req.validatedBody || req.body;
  const category = await categoryService.create(body);

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        'Category created successfully',
        category,
      ),
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  const slug = req.validatedParams?.slug || req.params?.slug;
  const body = req.validatedBody || req.body;
  const category = await categoryService.update(slug, body);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Category updated successfully',
        category,
      ),
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const slug = req.validatedParams?.slug || req.params?.slug;
  const result = await categoryService.remove(slug);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Category deleted successfully',
        result,
      ),
    );
});

export {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
