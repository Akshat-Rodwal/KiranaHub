import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    bannerType: {
      type: String,
      enum: ['top_single', 'instamart_card'],
      default: 'instamart_card',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: '',
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: [40, 'CTA text cannot exceed 40 characters'],
      default: 'SHOP NOW',
    },
    brandTag: {
      type: String,
      trim: true,
      maxlength: [80, 'Brand tag cannot exceed 80 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    bgColor: {
      type: String,
      trim: true,
      default: '#F8FAFC',
    },
    textColor: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    targetType: {
      type: String,
      enum: ['category', 'product', 'custom'],
      default: 'category',
    },
    targetId: {
      type: String,
      trim: true,
      default: '',
    },
    link: {
      type: String,
      trim: true,
      default: '/products',
    },
    // Optional legacy fields for backward compatibility
    position: {
      type: String,
      trim: true,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    bgGradient: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bannerSchema.index({ bannerType: 1, isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
