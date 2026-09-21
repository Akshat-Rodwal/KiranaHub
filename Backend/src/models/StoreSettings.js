import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      trim: true,
      default: 'KiranaHub',
    },
    announcementText: {
      type: String,
      trim: true,
      default: '⚡ Free Express Delivery on orders above ₹499! Groceries delivered in 20-30 mins.',
    },
    isStoreOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    promoCode: {
      type: String,
      trim: true,
      default: 'KIRANA50',
    },
    promoBannerText: {
      type: String,
      trim: true,
      default: 'Flat ₹50 OFF on your first grocery basket',
    },
    supportPhone: {
      type: String,
      trim: true,
      default: '9876543210',
    },
    deliveryTimeEstimate: {
      type: String,
      trim: true,
      default: '20-30 mins',
    },
  },
  {
    timestamps: true,
  },
);

storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

export default StoreSettings;
