import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: '/products',
    },
    position: {
      type: String,
      enum: ['hero_carousel', 'sub_banner_1', 'sub_banner_2', 'sub_banner_3'],
      default: 'hero_carousel',
      index: true,
    },
    badge: {
      type: String,
      trim: true,
      maxlength: [60, 'Badge cannot exceed 60 characters'],
      default: '',
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: [40, 'CTA text cannot exceed 40 characters'],
      default: 'Shop Now',
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

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
