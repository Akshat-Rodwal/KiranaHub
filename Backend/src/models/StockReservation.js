import mongoose from 'mongoose';

const reservedItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const stockReservationSchema = new mongoose.Schema(
  {
    cartToken: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    items: {
      type: [reservedItemSchema],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length > 0, 'Reservation must contain items'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-remove from collection when TTL expires
    },
    isReleased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const StockReservation = mongoose.model('StockReservation', stockReservationSchema);

export default StockReservation;
