import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, 'Identifier (email or mobile) is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms'],
      required: [true, 'Delivery channel is required'],
    },
    purpose: {
      type: String,
      enum: ['REGISTRATION', 'FORGOT_PASSWORD'],
      required: [true, 'OTP purpose is required'],
      index: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch pending OTP by identifier + purpose
otpSchema.index({ identifier: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
