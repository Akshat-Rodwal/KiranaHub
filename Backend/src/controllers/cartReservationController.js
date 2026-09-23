import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';
import Product from '../models/Product.js';
import StockReservation from '../models/StockReservation.js';

/**
 * POST /api/v1/cart/reserve-stock
 * Places a 5-minute inventory hold on items in customer's cart
 */
export const reserveStock = asyncHandler(async (req, res) => {
  const { items, cartToken } = req.body;
  const userId = req.user?._id || null;

  if (!cartToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart token is required for reservation');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Items array cannot be empty');
  }

  // 1. Release any prior existing reservation for this cartToken first
  const existingReservation = await StockReservation.findOne({ cartToken, isReleased: false });
  if (existingReservation) {
    for (const item of existingReservation.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { reservedStock: -item.quantity },
      });
    }
    await StockReservation.deleteOne({ _id: existingReservation._id });
  }

  // 2. Pre-verify availability for all items
  const resolvedList = [];

  for (const item of items) {
    const isObjectId = mongoose.Types.ObjectId.isValid(item.product);
    const query = isObjectId
      ? { $or: [{ _id: item.product }, { slug: item.product }], isActive: true }
      : { slug: item.product, isActive: true };

    const product = await Product.findOne(query);

    if (!product) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Item '${item.product}' is no longer available`);
    }

    const available = product.stock - (product.reservedStock || 0);

    if (available < item.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot hold inventory for '${product.name}'. Only ${Math.max(0, available)} available in stock.`,
      );
    }

    resolvedList.push({
      product,
      quantity: Number(item.quantity),
    });
  }

  // 3. Atomically increment reservedStock
  for (const resolved of resolvedList) {
    await Product.findByIdAndUpdate(resolved.product._id, {
      $inc: { reservedStock: resolved.quantity },
    });
  }

  // 4. Create 5-minute TTL reservation record
  const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);

  const reservation = await StockReservation.create({
    cartToken,
    userId,
    items: resolvedList.map((r) => ({
      product: r.product._id,
      quantity: r.quantity,
    })),
    expiresAt,
  });

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Inventory reserved for 5 minutes', {
      reservationId: reservation._id,
      cartToken,
      expiresAt,
      remainingSeconds: 300,
    }),
  );
});

/**
 * POST /api/v1/cart/release-stock
 * Releases reserved inventory back to the general pool
 */
export const releaseStock = asyncHandler(async (req, res) => {
  const { cartToken } = req.body;

  if (!cartToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart token is required');
  }

  const reservation = await StockReservation.findOne({ cartToken, isReleased: false });

  if (reservation) {
    for (const item of reservation.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { reservedStock: -item.quantity },
      });
    }
    reservation.isReleased = true;
    await StockReservation.deleteOne({ _id: reservation._id });
  }

  // Clean guard: ensure no negative reserved stock
  await Product.updateMany({ reservedStock: { $lt: 0 } }, { $set: { reservedStock: 0 } });

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Reserved stock released successfully'),
  );
});

export default {
  reserveStock,
  releaseStock,
};
