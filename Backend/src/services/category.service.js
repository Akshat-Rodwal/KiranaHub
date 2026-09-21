import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

const toCategoryDTO = (category, productCount) => ({
  id: category.slug,
  slug: category.slug,
  name: category.name,
  description: category.description,
  image: category.image,
  icon: category.icon,
  isActive: category.isActive,
  sortOrder: category.sortOrder,
  productCount: productCount ?? category.productCount ?? 0,
});

const getCategoryList = async ({ includeInactive = false } = {}) => {
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
  const category = await Category.findOne({ slug, isActive: true }).lean();
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
  const category = await Category.findOne({ slug, isActive: true })
    .select('_id')
    .lean();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${slug}' not found`);
  }
  return category._id;
};

const createCategory = async (data) => {
  const category = await Category.create(data);
  return toCategoryDTO(category, 0);
};

const updateCategory = async (slug, data) => {
  const category = await Category.findOneAndUpdate(
    { slug, isActive: true },
    { $set: data },
    { new: true }
  );

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${slug}' not found`);
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  return toCategoryDTO(category, productCount);
};

const deactivateCategory = async (slug) => {
  const category = await Category.findOneAndUpdate(
    { slug, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Category '${slug}' not found`);
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
  deactivateCategory,
};

export default {
  list: getCategoryList,
  bySlug: getCategoryBySlug,
  resolveId: resolveCategoryId,
  create: createCategory,
  update: updateCategory,
  remove: deactivateCategory,
};
