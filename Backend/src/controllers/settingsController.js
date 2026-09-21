import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';
import StoreSettings from '../models/StoreSettings.js';

const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await StoreSettings.getSettings();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Store settings retrieved', {
      storeName: settings.storeName,
      announcementText: settings.announcementText,
      isStoreOpen: settings.isStoreOpen,
      promoCode: settings.promoCode,
      promoBannerText: settings.promoBannerText,
      supportPhone: settings.supportPhone,
      deliveryTimeEstimate: settings.deliveryTimeEstimate,
      updatedAt: settings.updatedAt,
    }),
  );
});

const updateStoreSettings = asyncHandler(async (req, res) => {
  const settings = await StoreSettings.getSettings();

  const allowedFields = [
    'storeName',
    'announcementText',
    'isStoreOpen',
    'promoCode',
    'promoBannerText',
    'supportPhone',
    'deliveryTimeEstimate',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  }

  await settings.save();

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Store settings updated successfully', settings),
  );
});

export {
  getPublicSettings,
  updateStoreSettings,
};

export default {
  getPublicSettings,
  updateStoreSettings,
};
