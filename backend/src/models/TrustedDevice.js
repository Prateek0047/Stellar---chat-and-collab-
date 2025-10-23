import mongoose from "mongoose";

const trustedDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      ip: String,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for faster lookups
trustedDeviceSchema.index({ userId: 1, deviceFingerprint: 1 });

const TrustedDevice = mongoose.model("TrustedDevice", trustedDeviceSchema);

export default TrustedDevice;
