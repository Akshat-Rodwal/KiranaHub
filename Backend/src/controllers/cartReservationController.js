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
 * POST /api/v1/cart/validate
 * Cross-references live product stock and price before checkout.
 * Returns line-item discrepancies/alerts if price changed or stock depleted.
 */
export const validateCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(httpStatus.OK).json(
      new ApiResponse(httpStatus.OK, 'Cart is empty', {
        valid: true,
        alerts: [],
        items: [],
      }),
    );
  }

  const alerts = [];
  const validatedItems = [];

  for (const item of items) {
    const rawRef = item.productId || item.product || item.id || item.slug;
    const isObjectId = mongoose.Types.ObjectId.isValid(rawRef);
    const query = isObjectId
      ? { $or: [{ _id: rawRef }, { slug: rawRef }], isActive: true }
      : { slug: rawRef, isActive: true };

    const product = await Product.findOne(query);

    if (!product) {
      alerts.push({
        type: 'UNAVAILABLE',
        severity: 'error',
        productId: rawRef,
        name: item.name || 'Unknown item',
        message: `"${item.name || rawRef}" is no longer available in store.`,
      });
      continue;
    }

    const livePrice = product.price;
    const requestedPrice = item.price ?? item.sellingPrice;
    if (requestedPrice !== undefined && Number(requestedPrice) !== Number(livePrice)) {
      alerts.push({
        type: 'PRICE_CHANGED',
        severity: 'warning',
        productId: product._id,
        name: product.name,
        oldPrice: requestedPrice,
        newPrice: livePrice,
        message: `Price for "${product.name}" updated from ₹${requestedPrice} to ₹${livePrice}.`,
      });
    }

    const availableStock = product.stock;
    const requestedQty = Number(item.quantity) || 1;

    if (availableStock <= 0) {
      alerts.push({
        type: 'OUT_OF_STOCK',
        severity: 'error',
        productId: product._id,
        name: product.name,
        availableStock: 0,
        message: `"${product.name}" is currently out of stock.`,
      });
    } else if (availableStock < requestedQty) {
      alerts.push({
        type: 'INSUFFICIENT_STOCK',
        severity: 'warning',
        productId: product._id,
        name: product.name,
        availableStock,
        requestedQty,
        message: `Only ${availableStock} units of "${product.name}" available (you requested ${requestedQty}).`,
      });
    }

    validatedItems.push({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: livePrice,
      mrp: product.mrp || livePrice,
      stock: availableStock,
      inStock: availableStock > 0,
      image: product.images?.[0]?.url || product.image || '',
    });
  }

  const hasBlockingErrors = alerts.some((a) => a.severity === 'error');

  return res.status(httpStatus.OK).json(
    new ApiResponse(httpStatus.OK, 'Cart validation complete', {
      valid: !hasBlockingErrors && alerts.length === 0,
      hasBlockingErrors,
      alerts,
      items: validatedItems,
    }),
  );
});
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
