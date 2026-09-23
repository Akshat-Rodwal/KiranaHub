import mongoose from 'mongoose';

const bundleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false },
);

const bundleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bundle name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Bundle slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    badge: {
      type: String,
      trim: true,
      default: '⚡ 10% BUNDLE SAVINGS',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'essentials',
    },
    discountPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 90,
    },
    items: {
      type: [bundleItemSchema],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length > 0, 'Bundle must contain at least one item'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Bundle = mongoose.model('Bundle', bundleSchema);

export default Bundle;
