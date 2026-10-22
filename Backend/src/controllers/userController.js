import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

/**
 * GET /api/v1/users/me/export-data
 * GDPR Article 20 / CCPA: Right to Data Portability.
 * Exports full profile, addresses, and transaction ledger in machine-readable JSON format.
 */
export const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User profile not found');
  }

  // Fetch all orders associated with this customer
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  const exportPayload = {
    metadata: {
      standard: 'GDPR (EU 2016/679) & CCPA Right to Portability',
      exportedAt: new Date().toISOString(),
      platform: 'KiranaHub Quick-Commerce',
      userId: user._id,
    },
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    savedAddresses: user.addresses || [],
    orderLedger: orders.map((o) => ({
      orderId: o._id,
      date: o.createdAt,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      items: o.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        unit: i.unit,
      })),
      pricing: o.pricing,
      deliveryAddress: o.deliveryAddress,
      shipping: o.shipping || null,
      refund: o.refund || null,
    })),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="kiranahub-export-${user._id.toString().slice(-6)}.json"`,
  );

  return res.status(httpStatus.OK).json(exportPayload);
});

/**
 * DELETE /api/v1/users/me/delete-account
 * GDPR Article 17 / CCPA: Right to be Forgotten.
 * Anonymizes customer PII to satisfy privacy mandate while retaining
 * financial transaction records required for statutory tax & audit compliance.
 */
export const deleteAccountAnonymize = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Anonymize PII
  const anonymizedTag = `anon_${userId.toString().slice(-8)}`;
  user.name = `Anonymized User (${anonymizedTag})`;
  user.email = `${anonymizedTag}@deleted.kiranahub.local`;
  user.phone = undefined;
  user.googleId = null;
  user.avatar = '';
  user.addresses = [];
  user.isActive = false;
  user.isVerified = false;

  await user.save();

  // Clear HTTP-only auth cookies if set
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Account and PII successfully anonymized under GDPR compliance.', {
      anonymized: true,
      userId: user._id,
    }),
  );
});

export default {
  exportUserData,
  deleteAccountAnonymize,
};
