import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import categoryService from '../services/category.service.js';

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.list(req.validatedQuery);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Categories retrieved successfully',
        { items: categories },
      ),
    );
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.bySlug(req.validatedParams.slug);

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
  const category = await categoryService.create(req.validatedBody);

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
  const category = await categoryService.update(
    req.validatedParams.slug,
    req.validatedBody,
  );

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
  const result = await categoryService.remove(req.validatedParams.slug);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Category deactivated successfully',
        result,
      ),
    );
});

export {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
