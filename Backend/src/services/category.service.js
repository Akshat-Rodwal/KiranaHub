import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import categorySeedData from '../seeders/data/categories.js';

const toCategoryDTO = (category, productCount) => ({
  _id: category._id ? String(category._id) : undefined,
  id: category.slug,
  slug: category.slug,
  name: category.name,
  description: category.description || '',
  image: category.image || '',
  icon: category.icon || '',
  isActive: category.isActive !== false,
  sortOrder: category.sortOrder || 0,
  itemCount: productCount ?? category.productCount ?? 0,
  productCount: productCount ?? category.productCount ?? 0,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

/**
 * Ensures categories exist in MongoDB. If collection is empty, auto-seeds default categories.
 */
export const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(categorySeedData);
  }
};

const getCategoryList = async ({ includeInactive = false } = {}) => {
  await ensureDefaultCategories();
  const matchStage = includeInactive ? {} : { isActive: true };

  const categories = await Category.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: Product.collection.name,
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$category', '$$categoryId'] },
              isActive: true,
            },
          },
          { $count: 'count' },
        ],
        as: 'productCountData',
      },
    },
    {
      $addFields: {
        productCount: {
          $ifNull: [{ $first: '$productCountData.count' }, 0],
        },
      },
    },
    { $project: { productCountData: 0 } },
    { $sort: { sortOrder: 1, name: 1 } },
  ]);

  return categories.map((category) => toCategoryDTO(category));
};

const getCategoryBySlug = async (slug) => {
  await ensureDefaultCategories();
  const query = mongoose.isValidObjectId(slug)
    ? { $or: [{ _id: slug }, { slug }] }
    : { slug };

  const category = await Category.findOne(query).lean();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${slug}' not found`);
  }
  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });
  return toCategoryDTO(category, productCount);
};

const resolveCategoryId = async (slug) => {
  await ensureDefaultCategories();
  const query = mongoose.isValidObjectId(slug)
    ? { $or: [{ _id: slug }, { slug }] }
    : { slug };

  const category = await Category.findOne(query).select('_id').lean();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${slug}' not found`);
  }
  return category._id;
};

const createCategory = async (data) => {
  const category = await Category.create(data);
  return toCategoryDTO(category, 0);
};

const updateCategory = async (idOrSlug, data) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const category = await Category.findOneAndUpdate(
    query,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${idOrSlug}' not found`);
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  return toCategoryDTO(category, productCount);
};

const deleteCategory = async (idOrSlug) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const category = await Category.findOneAndDelete(query);

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${idOrSlug}' not found`);
  }

  return { message: 'Category deleted successfully', id: category._id, slug: category.slug };
};

const deactivateCategory = async (idOrSlug) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const category = await Category.findOneAndUpdate(
    query,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${idOrSlug}' not found`);
  }

  return { message: 'Category deactivated successfully' };
};

export {
  toCategoryDTO,
  getCategoryList,
  getCategoryBySlug,
  resolveCategoryId,
  createCategory,
  updateCategory,
  deleteCategory,
  deactivateCategory,
};

export default {
  list: getCategoryList,
  bySlug: getCategoryBySlug,
  resolveId: resolveCategoryId,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
  remove: deleteCategory,
  deactivate: deactivateCategory,
};
