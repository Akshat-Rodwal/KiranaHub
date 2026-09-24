import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

const phonePattern = /^(?:(?:\+91|91)[6-9]\d{9}|[6-9]\d{9})$/;
const pincodePattern = /^\d{6}$/;

export const validateOrderCreate = (req, _res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Order must contain at least one item');
    }

    const validatedItems = items.map((item, idx) => {
      const productId = item.product || item.productId || item.id || item._id;
      const quantity = parseInt(item.quantity, 10);

      if (!productId) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Item at index ${idx} is missing a valid product ID`,
        );
      }
      if (!quantity || quantity < 1) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Quantity for item at index ${idx} must be at least 1`,
        );
      }

      return {
        product: productId,
        quantity,
      };
    });

    if (!deliveryAddress || typeof deliveryAddress !== 'object') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Delivery address is required');
    }

    const {
      receiverName,
      receiverPhone,
      addressLine1,
      city,
      state,
      pincode,
    } = deliveryAddress;

    if (!receiverName?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Receiver name is required');
    }
    if (!receiverPhone?.trim() || !phonePattern.test(receiverPhone.trim().replace(/\s+/g, ''))) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Valid 10-digit receiver mobile number is required',
      );
    }
    if (!addressLine1?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Address line 1 (house/flat/street) is required');
    }
    if (!city?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'City is required');
    }
    if (!state?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'State is required');
    }
    if (!pincode?.trim() || !pincodePattern.test(pincode.trim())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Valid 6-digit postal pincode is required');
    }

    const allowedPaymentMethods = ['COD', 'UPI', 'CARD', 'WALLET', 'ONLINE'];
    const selectedPayment = (paymentMethod || 'COD').toUpperCase();
    if (!allowedPaymentMethods.includes(selectedPayment)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Payment method must be one of: ${allowedPaymentMethods.join(', ')}`,
      );
    }

    req.validatedBody = {
      items: validatedItems,
      deliveryAddress: {
        type: deliveryAddress.type || 'HOME',
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: (deliveryAddress.addressLine2 || '').trim(),
        landmark: (deliveryAddress.landmark || '').trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        coords: deliveryAddress.coords && typeof deliveryAddress.coords.lat === 'number' && typeof deliveryAddress.coords.lng === 'number'
          ? { lat: deliveryAddress.coords.lat, lng: deliveryAddress.coords.lng }
          : undefined,
      },
      paymentMethod: selectedPayment,
      deliveryTip: typeof req.body?.deliveryTip === 'number' ? req.body.deliveryTip : 0,
      deliveryInstructions: req.body?.deliveryInstructions || [],
      cartToken: req.body?.cartToken || null,
    };

    next();
  } catch (err) {
    next(err);
  }
};
