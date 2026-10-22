import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import { resolveCategoryId } from './category.service.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sortMap = {
  'name-asc': { name: 1 },
  'name_asc': { name: 1 },
  'name-desc': { name: -1 },
  'name_desc': { name: -1 },
  'price-asc': { price: 1 },
  'price_asc': { price: 1 },
  'price-desc': { price: -1 },
  'price_desc': { price: -1 },
  'rating-desc': { rating: -1, reviewCount: -1 },
  'rating_desc': { rating: -1, reviewCount: -1 },
  newest: { createdAt: -1 },
  popular: { reviewCount: -1, rating: -1, createdAt: -1 },
  popularity: { reviewCount: -1, rating: -1, createdAt: -1 },
};

const toProductDTO = (product) => {
  const category = product.category;
  const categoryName =
    typeof category === 'object' && category !== null
      ? category.name
      : product.categoryName || '';
  const categorySlug =
    typeof category === 'object' && category !== null
      ? category.slug
      : product.categorySlug || '';

  const image = product.images?.[0]?.url || product.image || '';
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return {
    _id: product._id,
    id: product.slug,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    image,
    images: (product.images || []).map((img) => (typeof img === 'string' ? img : img.url)),
    category: categoryName,
    categorySlug,
    subCategory: product.subCategory || '',
    brand: product.brand,
    unit: product.unit,
    price: product.price,
    mrp: product.mrp,
    originalPrice: product.mrp,
    sellingPrice: product.price,
    discount,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    isNew: product.isNewArrival,
    featured: product.featured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    isFlashDeal: product.isFlashDeal,
    isPopular: product.isPopular,
    createdAt: product.createdAt,
  };
};

const buildFilter = async ({
  search = '',
  category = '',
  subCategory = '',
  brand = '',
  minPrice,
  maxPrice,
  priceRange = '',
  rating,
  minRating,
  inStock,
  featured = false,
  bestSeller = false,
  newArrival = false,
  flashDeal = false,
  popular = false,
}) => {
  const filter = { isActive: true };

  // Full-text search with regex scoring across name, description, brand, and tags
  if (search) {
    const escaped = escapeRegex(search.trim());
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { name: regex },
      { description: regex },
      { shortDescription: regex },
      { brand: regex },
      { tags: regex },
    ];
  }

  if (category) {
    filter.category = await resolveCategoryId(category);
  }

  if (subCategory) {
    const subRegex = new RegExp(escapeRegex(subCategory.trim()), 'i');
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [{ subCategory: subRegex }, { tags: subRegex }],
    });
  }

  if (brand) {
    if (brand.includes(',')) {
      const brands = brand
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)
        .map((b) => new RegExp(`^${escapeRegex(b)}$`, 'i'));
      filter.brand = { $in: brands };
    } else {
      filter.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, 'i');
    }
  }

  // Price Range parsing: supports "min-max" string or minPrice / maxPrice numbers
  let min = minPrice;
  let max = maxPrice;
  if (priceRange && typeof priceRange === 'string' && priceRange.includes('-')) {
    const [pMin, pMax] = priceRange.split('-').map(Number);
    if (!isNaN(pMin)) min = pMin;
    if (!isNaN(pMax)) max = pMax;
  }

  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined && !isNaN(Number(min))) filter.price.$gte = Number(min);
    if (max !== undefined && !isNaN(Number(max))) filter.price.$lte = Number(max);
  }

  // inStock boolean filtering
  if (inStock === true || inStock === 'true' || inStock === 1 || inStock === '1') {
    filter.stock = { $gt: 0 };
  } else if (inStock === false || inStock === 'false' || inStock === 0 || inStock === '0') {
    filter.stock = { $eq: 0 };
  }

  // Rating filtering
  const targetRating = rating !== undefined ? rating : minRating;
  if (targetRating !== undefined && !isNaN(Number(targetRating))) {
    filter.rating = { $gte: Number(targetRating) };
  }

  if (featured) filter.featured = true;
  if (bestSeller) filter.isBestSeller = true;
  if (newArrival) filter.isNewArrival = true;
  if (flashDeal) filter.isFlashDeal = true;
  if (popular) filter.isPopular = true;

  return filter;
};

const getProductList = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 12;
  const sort = sortMap[query.sort] || sortMap.popular;

  const filter = await buildFilter(query);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate({ path: 'category', select: 'name slug' })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(toProductDTO),
    pagination: {
      page,
      currentPage: page,
      limit,
      total,
      totalProducts: total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      count: items.length,
    },
  };
};
      hasPrevPage: page > 1,
    },
  };
};

const getProductBySlug = async (slugOrId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
  const query = isObjectId
    ? { $or: [{ slug: slugOrId }, { _id: slugOrId }], isActive: true }
    : { slug: slugOrId, isActive: true };

  const product = await Product.findOne(query)
    .populate({ path: 'category', select: 'name slug' })
    .lean();

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product '${slugOrId}' not found`);
  }

  return toProductDTO(product);
};

const getRelatedProducts = async (slug, limit = 8) => {
  const product = await Product.findOne({ slug, isActive: true })
    .select('category')
    .lean();

  if (!product) return [];

  const items = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .populate({ path: 'category', select: 'name slug' })
    .sort({ reviewCount: -1, rating: -1 })
    .limit(limit)
    .lean();

  return items.map(toProductDTO);
};

const createProduct = async (data) => {
  const categoryId = await resolveCategoryId(data.category).catch(async () => {
    // If passed ObjectId string
    return data.category;
  });

  const product = await Product.create({
    ...data,
    category: categoryId,
  });

  return toProductDTO(product);
};

const updateProduct = async (slug, data) => {
  const product = await Product.findOneAndUpdate(
    { slug, isActive: true },
    { $set: data },
    { new: true }
  ).populate({ path: 'category', select: 'name slug' });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product '${slug}' not found`);
  }

  return toProductDTO(product);
};

const deactivateProduct = async (slug) => {
  const product = await Product.findOneAndUpdate(
    { slug, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product '${slug}' not found`);
  }

  return { message: 'Product deactivated successfully' };
};

export {
  toProductDTO,
  getProductList,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
};

export default {
  list: getProductList,
  bySlug: getProductBySlug,
  related: getRelatedProducts,
  create: createProduct,
  update: updateProduct,
  remove: deactivateProduct,
};
