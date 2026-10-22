import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

/**
 * Calculates dynamic logistics/shipping fee based on weight and order value.
 */
export const calculateShippingFee = ({ weightGrams = 500, subtotal = 0 }) => {
  if (subtotal >= 499) {
    return 0; // Free delivery over ₹499
  }
  if (weightGrams > 2000) {
    return 60; // Heavy parcel tier
  }
  return 40; // Standard tier
};

/**
 * Generates an AWB code based on city and timestamp
 */
export const generateAWB = (city = 'DEL') => {
  const code = (city || 'DEL').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'DEL');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KH-${code}-${rand}`;
};

/**
 * Generates or retrieves shipping label for an order.
 */
export const generateShippingLabel = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const cityCode = order.deliveryAddress?.city?.slice(0, 3) || 'DEL';
  const carriers = ['KiranaHub Express', 'Delhivery Quick', 'BlueDart Ground'];
  const selectedCarrier = carriers[Math.floor(Math.random() * carriers.length)];

  // Estimate total weight (items count * 350g or min 500g)
  const totalItemsCount = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const weightGrams = Math.max(500, totalItemsCount * 350);

  const awb = order.shipping?.awb || generateAWB(cityCode);
  const carrier = order.shipping?.carrier || selectedCarrier;
  const shippingFee = calculateShippingFee({ weightGrams, subtotal: order.pricing?.subtotal || 0 });
  const declaredValue = order.pricing?.grandTotal || 0;
  const trackingUrl = `https://track.kiranahub.in/shipment/${awb}`;

  // Update order with shipping metadata if not present
  if (!order.shipping || !order.shipping.awb) {
    order.shipping = {
      awb,
      carrier,
      trackingUrl,
      weightGrams,
      shippingFee,
      declaredValue,
      labelGeneratedAt: new Date(),
    };
    await order.save();
  }

  const labelData = {
    awb: order.shipping.awb || awb,
    carrier: order.shipping.carrier || carrier,
    trackingUrl: order.shipping.trackingUrl || trackingUrl,
    weightGrams: order.shipping.weightGrams || weightGrams,
    declaredValue: order.shipping.declaredValue || declaredValue,
    shippingFee: order.shipping.shippingFee || shippingFee,
    labelGeneratedAt: order.shipping.labelGeneratedAt || new Date(),
    orderId: order._id,
    orderDate: order.createdAt,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    sender: {
      hubName: 'KiranaHub Central Fulfilment Hub #04',
      address: 'Plot 42, Okhla Phase III, Industrial Area',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      gstin: '07AAAAA0000A1Z5',
      fssai: '10019011000123',
      phone: '+91 11 4050 9999',
    },
    recipient: {
      name: order.deliveryAddress.receiverName,
      phone: order.deliveryAddress.receiverPhone,
      addressLine1: order.deliveryAddress.addressLine1,
      addressLine2: order.deliveryAddress.addressLine2 || '',
      landmark: order.deliveryAddress.landmark || '',
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      pincode: order.deliveryAddress.pincode,
    },
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      price: i.price,
      lineTotal: i.price * i.quantity,
    })),
    barcode: `*${order.shipping.awb || awb}*`,
  };

  return labelData;
};

export default {
  calculateShippingFee,
  generateAWB,
  generateShippingLabel,
};
