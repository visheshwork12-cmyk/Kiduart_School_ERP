import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "#config/index.js";
import logger from "#config/logger.js";
import { ROLES } from "#shared/constants/roles.js";

const globalAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [ROLES.GLOBAL_SUPER_ADMIN],
      default: ROLES.GLOBAL_SUPER_ADMIN,
      immutable: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Ensure only one Global Super Admin
globalAdminSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: ROLES.GLOBAL_SUPER_ADMIN } },
);

// Password hashing
globalAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const rounds = parseInt(config.bcryptSaltRounds || "10", 10);
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  } catch (error) {
    logger.error(`Password hashing error: ${error.message}`);
    next(error);
  }
});

// Compare password
globalAdminSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("GlobalAdmin", globalAdminSchema);
