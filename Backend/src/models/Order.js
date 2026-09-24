import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product selling price is required'],
      min: 0,
    },
    mrp: {
      type: Number,
      required: [true, 'Product MRP is required'],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      trim: true,
      default: '1 pc',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false },
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['HOME', 'WORK', 'OTHER'],
      default: 'HOME',
    },
    receiverName: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true,
    },
    receiverPhone: {
      type: String,
      required: [true, 'Receiver phone is required'],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: '',
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    handlingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 2,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order user is required'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Order must have at least one item',
      ],
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, 'Delivery address is required'],
    },
    pricing: {
      type: pricingSchema,
      required: [true, 'Pricing breakdown is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD', 'WALLET', 'ONLINE'],
      default: 'COD',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    expectedDeliveryTime: {
      type: String,
      default: '10-15 mins',
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    deliveryPartner: {
      name: { type: String, default: 'Vikram Singh' },
      phone: { type: String, default: '+91 98765 43210' },
      fleetNumber: { type: String, default: 'KiranaHub Fleet #402' },
      rating: { type: Number, default: 4.9 },
      vehicle: { type: String, default: 'Delivery Scooter (DL-08-SK-4022)' },
      vaccinated: { type: Boolean, default: true },
      temperature: { type: String, default: '36.4°C' },
    },
    deliveryBoy: {
      name: { type: String, default: 'Vikram Singh' },
      phone: { type: String, default: '+91 98765 43210' },
      currentCoords: {
        lat: { type: Number, default: 28.6328 },
        lng: { type: Number, default: 77.2167 },
      },
    },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    deliveryTip: {
      type: Number,
      default: 0,
    },
    deliveryInstructions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
