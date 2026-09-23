import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [160, 'Product name cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'],
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [40, 'Unit cannot exceed 40 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reservedStock: {
      type: Number,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [80, 'Brand cannot exceed 80 characters'],
      default: '',
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isFlashDeal: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('discount').get(function () {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.virtual('image').get(function () {
  return this.images?.[0]?.url || '';
});

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, featured: 1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });
productSchema.index({ isActive: 1, isNewArrival: 1 });
productSchema.index({ isActive: 1, isFlashDeal: 1 });
productSchema.index({ isActive: 1, isPopular: 1 });
productSchema.index({ isActive: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
