import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import Bundle from '../models/Bundle.js';
import Product from '../models/Product.js';

const DEFAULT_BUNDLES = [
  {
    name: 'Tea-Time Essentials Combo',
    slug: 'tea-time-essentials',
    badge: '☕ 12% OFF COMBO',
    description: 'Fresh milk, premium tea leaves, pure sugar, and crisp butter cookies for the perfect evening chai.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    category: 'tea-time',
    discountPercent: 12,
    productKeywords: ['tea', 'milk', 'sugar', 'biscuit', 'cookie'],
  },
  {
    name: 'Morning Breakfast Power Pack',
    slug: 'morning-breakfast-pack',
    badge: '🍳 10% BUNDLE SAVINGS',
    description: 'Fresh whole wheat bread, farm fresh eggs, creamy butter, and ripe bananas to start your day strong.',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    category: 'breakfast',
    discountPercent: 10,
    productKeywords: ['bread', 'egg', 'butter', 'banana', 'jam'],
  },
  {
    name: 'North Indian Tadka & Dal Basket',
    slug: 'north-indian-tadka-basket',
    badge: '🌾 PANTRY SUPER SAVER',
    description: 'Sharbati atta, unpolished toor dal, cold-pressed mustard oil, and whole jeera for hearty homestyle meals.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    category: 'staples',
    discountPercent: 15,
    productKeywords: ['atta', 'dal', 'oil', 'jeera', 'rice'],
  },
];

const seedDefaultBundlesIfEmpty = async () => {
  const count = await Bundle.countDocuments();
  if (count > 0) return;

  const allProducts = await Product.find({ isActive: true }).select('_id name slug price mrp images unit stock').lean();
  if (allProducts.length === 0) return;

  for (const def of DEFAULT_BUNDLES) {
    const matchedProducts = [];

    for (const kw of def.productKeywords) {
      const p = allProducts.find(
        (prod) =>
          prod.name.toLowerCase().includes(kw) ||
          prod.slug.toLowerCase().includes(kw)
      );
      if (p && !matchedProducts.some((m) => m._id.toString() === p._id.toString())) {
        matchedProducts.push(p);
      }
    }

    // If keywords didn't find enough, pick 3 available items
    if (matchedProducts.length < 2) {
      for (const p of allProducts) {
        if (!matchedProducts.some((m) => m._id.toString() === p._id.toString())) {
          matchedProducts.push(p);
        }
        if (matchedProducts.length >= 3) break;
      }
    }

    if (matchedProducts.length > 0) {
      await Bundle.create({
        name: def.name,
        slug: def.slug,
        badge: def.badge,
        description: def.description,
        imageUrl: def.imageUrl,
        category: def.category,
        discountPercent: def.discountPercent,
        items: matchedProducts.map((p) => ({
          product: p._id,
          quantity: 1,
        })),
        isActive: true,
      });
    }
  }
};

/**
 * GET /api/v1/bundles
 * Fetches all active bundles with calculated savings and item pricing
 */
export const getBundles = asyncHandler(async (_req, res) => {
  await seedDefaultBundlesIfEmpty();

  const rawBundles = await Bundle.find({ isActive: true })
    .populate({
      path: 'items.product',
      select: '_id name slug price mrp images unit stock inStock isActive',
    })
    .lean();

  const bundles = rawBundles
    .map((bundle) => {
      // Filter out deleted/inactive products
      const validItems = (bundle.items || []).filter((item) => item.product && item.product.isActive !== false);

      if (validItems.length === 0) return null;

      let regularSubtotal = 0;
      let mrpSubtotal = 0;

      const itemsWithCalculations = validItems.map((item) => {
        const prod = item.product;
        const linePrice = (prod.price || 0) * (item.quantity || 1);
        const lineMrp = (prod.mrp || prod.price || 0) * (item.quantity || 1);

        regularSubtotal += linePrice;
        mrpSubtotal += lineMrp;

        return {
          product: prod,
          quantity: item.quantity,
          linePrice,
          lineMrp,
        };
      });

      const discountPercent = bundle.discountPercent || 10;
      const bundlePrice = Math.round(regularSubtotal * (1 - discountPercent / 100));
      const savings = Math.max(0, mrpSubtotal - bundlePrice);

      return {
        ...bundle,
        items: itemsWithCalculations,
        itemCount: validItems.length,
        regularSubtotal,
        mrpSubtotal,
        bundlePrice,
        savings,
      };
    })
    .filter(Boolean);

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Bundles retrieved successfully', {
      count: bundles.length,
      bundles,
    }),
  );
});

export default {
  getBundles,
};
