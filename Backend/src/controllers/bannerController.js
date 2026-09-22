import Banner from '../models/Banner.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import { defaultBanners } from '../seeders/data/banners.js';

/**
 * Ensures that both 'top_single' and 'instamart_card' banner types
 * have active default banners seeded in MongoDB.
 */
export const ensureDefaultBanners = async () => {
  const count = await Banner.countDocuments();
  if (count === 0) {
    await Banner.insertMany(defaultBanners);
    return;
  }

  const existingTypes = await Banner.distinct('bannerType');
  const requiredTypes = ['top_single', 'instamart_card'];
  const missingTypes = requiredTypes.filter((t) => !existingTypes.includes(t));

  if (missingTypes.length > 0) {
    const toInsert = defaultBanners.filter((b) => missingTypes.includes(b.bannerType));
    if (toInsert.length > 0) {
      await Banner.insertMany(toInsert);
    }
  }
};

/**
 * Public: Get active banners
 * Supports ?type=top_single or ?type=instamart_card
 */
export const getBanners = asyncHandler(async (req, res) => {
  await ensureDefaultBanners();
  const filter = {};

  // Active status filter
  if (req.query.active === 'false' || req.query.isActive === 'false') {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  // Type filter
  const requestedType = req.query.type || req.query.bannerType;
  if (requestedType) {
    filter.$or = [
      { bannerType: requestedType },
      { position: requestedType },
    ];
  }

  const banners = await Banner.find(filter).sort({ order: 1, createdAt: 1 }).lean();

  const topSingle =
    banners.find((b) => b.bannerType === 'top_single' || b.position === 'top_single') ||
    banners[0] ||
    null;

  const instamartCards = banners.filter(
    (b) => b.bannerType === 'instamart_card' || (!b.bannerType && b.position !== 'top_single')
  );

  return res.status(httpStatus.OK).json({
    success: true,
    message: 'Banners retrieved successfully',
    data: {
      banners,
      top_single: topSingle,
      instamart_cards: instamartCards,
      all: banners,
    },
    banners,
  });
});

/**
 * Admin: Get all banners (including inactive)
 */
export const getAdminBanners = asyncHandler(async (req, res) => {
  await ensureDefaultBanners();
  const banners = await Banner.find().sort({ bannerType: 1, order: 1, createdAt: -1 }).lean();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Admin banners retrieved successfully', banners)
  );
});

/**
 * Admin: Create a new banner
 */
export const createBanner = asyncHandler(async (req, res) => {
  const {
    bannerType = 'instamart_card',
    title,
    subtitle,
    ctaText,
    brandTag,
    badge,
    imageUrl,
    bgImageUrl,
    bgColor,
    textColor,
    targetType,
    targetId,
    link,
    order,
    isActive,
    position,
  } = req.body;

  if (!imageUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image URL is required');
  }

  let resolvedLink = link?.trim() || '/products';
  if (targetType === 'category' && targetId) {
    resolvedLink = `/products?category=${encodeURIComponent(targetId.trim())}`;
  } else if (targetType === 'product' && targetId) {
    resolvedLink = `/product/${encodeURIComponent(targetId.trim())}`;
  }

  const banner = await Banner.create({
    bannerType: bannerType || 'instamart_card',
    title: title?.trim() || '',
    subtitle: subtitle?.trim() || '',
    ctaText: ctaText?.trim() || 'SHOP NOW',
    brandTag: brandTag?.trim() || '',
    badge: badge?.trim() || '',
    imageUrl: imageUrl.trim(),
    bgImageUrl: bgImageUrl?.trim() || '',
    bgColor: bgColor?.trim() || '#F8FAFC',
    textColor: textColor === 'light' ? 'light' : 'dark',
    targetType: targetType || 'category',
    targetId: targetId?.trim() || '',
    link: resolvedLink,
    order: Number.isInteger(Number(order)) ? Number(order) : 0,
    isActive: typeof isActive === 'boolean' ? isActive : true,
    position: position || (bannerType === 'top_single' ? 'top_single' : 'hero_carousel'),
  });

  return res.status(httpStatus.CREATED).json(
    new ApiResponse(httpStatus.CREATED, 'Banner created successfully', banner)
  );
});

/**
 * Admin: Update banner by ID
 */
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.targetType && updates.targetId !== undefined) {
    if (updates.targetType === 'category' && updates.targetId) {
      updates.link = `/products?category=${encodeURIComponent(updates.targetId.trim())}`;
    } else if (updates.targetType === 'product' && updates.targetId) {
      updates.link = `/product/${encodeURIComponent(updates.targetId.trim())}`;
    }
  }

  const banner = await Banner.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Banner updated successfully', banner)
  );
});

/**
 * Admin: Delete banner by ID
 */
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findByIdAndDelete(id);

  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Banner deleted successfully', { id })
  );
});

export default {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
