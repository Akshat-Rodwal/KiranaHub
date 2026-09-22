import Banner from '../models/Banner.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import { defaultBanners } from '../seeders/data/banners.js';

/**
 * Ensures that all 4 slots (hero_carousel, sub_banner_1, sub_banner_2, sub_banner_3)
 * have active default banners seeded in MongoDB.
 */
export const ensureDefaultBanners = async () => {
  const count = await Banner.countDocuments();
  if (count === 0) {
    await Banner.insertMany(defaultBanners);
    return;
  }

  const existingPositions = await Banner.distinct('position');
  const requiredPositions = ['hero_carousel', 'sub_banner_1', 'sub_banner_2', 'sub_banner_3'];
  const missingPositions = requiredPositions.filter((pos) => !existingPositions.includes(pos));

  if (missingPositions.length > 0) {
    const toInsert = defaultBanners.filter((b) => missingPositions.includes(b.position));
    if (toInsert.length > 0) {
      await Banner.insertMany(toInsert);
    }
  }
};

/**
 * Public: Get active banners
 * Groups into hero_carousel, sub_banner_1, sub_banner_2, sub_banner_3
 */
export const getBanners = asyncHandler(async (req, res) => {
  await ensureDefaultBanners();
  const filter = {};
  if (req.query.active === 'false' || req.query.isActive === 'false') {
    filter.isActive = false;
  } else {
    // Default or active=true: only return active banners for customer storefront
    filter.isActive = true;
  }
  const banners = await Banner.find(filter).sort({ order: 1, createdAt: 1 }).lean();

  const heroCarousel = banners.filter((b) => b.position === 'hero_carousel');
  const subBanner1 = banners.find((b) => b.position === 'sub_banner_1') || null;
  const subBanner2 = banners.find((b) => b.position === 'sub_banner_2') || null;
  const subBanner3 = banners.find((b) => b.position === 'sub_banner_3') || null;

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Banners retrieved successfully', {
      hero_carousel: heroCarousel,
      sub_banner_1: subBanner1,
      sub_banner_2: subBanner2,
      sub_banner_3: subBanner3,
      all: banners,
    })
  );
});

/**
 * Admin: Get all banners (including inactive)
 */
export const getAdminBanners = asyncHandler(async (req, res) => {
  await ensureDefaultBanners();
  const banners = await Banner.find().sort({ position: 1, order: 1, createdAt: -1 }).lean();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Admin banners retrieved successfully', banners)
  );
});

/**
 * Admin: Create a new banner
 */
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, imageUrl, link, position, badge, ctaText, bgGradient, order, isActive } = req.body;

  if (!title || !imageUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Banner title and image URL are required');
  }

  const validPositions = ['hero_carousel', 'sub_banner_1', 'sub_banner_2', 'sub_banner_3'];
  if (position && !validPositions.includes(position)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Position must be one of: ${validPositions.join(', ')}`);
  }

  const banner = await Banner.create({
    title: title.trim(),
    subtitle: subtitle?.trim() || '',
    imageUrl: imageUrl.trim(),
    link: link?.trim() || '/products',
    position: position || 'hero_carousel',
    badge: badge?.trim() || '',
    ctaText: ctaText?.trim() || 'Shop Now',
    bgGradient: bgGradient?.trim() || '',
    order: Number.isInteger(Number(order)) ? Number(order) : 0,
    isActive: typeof isActive === 'boolean' ? isActive : true,
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
  const updates = req.body;

  if (updates.position) {
    const validPositions = ['hero_carousel', 'sub_banner_1', 'sub_banner_2', 'sub_banner_3'];
    if (!validPositions.includes(updates.position)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Position must be one of: ${validPositions.join(', ')}`);
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
