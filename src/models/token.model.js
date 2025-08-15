import mongoose from "mongoose";
import logger from "#config/logger.js";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, expires: 0 }, // TTL index
    isRevoked: { type: Boolean, default: false },
    createdByIp: { type: String, required: true },
    replacedByToken: { type: String },
  },
  { timestamps: true },
);

// TTL index for automatic expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Token", tokenSchema);
