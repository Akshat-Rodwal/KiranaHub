import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import productService from '../services/product.service.js';

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.list(req.validatedQuery);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, 'Products retrieved successfully', result),
    );
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.bySlug(req.validatedParams.slug);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, 'Product retrieved successfully', product),
    );
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  const items = await productService.related(req.validatedParams.slug, limit);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Related products retrieved successfully',
        { items },
      ),
    );
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.validatedBody);

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        'Product created successfully',
        product,
      ),
    );
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(
    req.validatedParams.slug,
    req.validatedBody,
  );

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Product updated successfully',
        product,
      ),
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.remove(req.validatedParams.slug);

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(
        httpStatus.OK,
        'Product deactivated successfully',
        result,
      ),
    );
});

export {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
