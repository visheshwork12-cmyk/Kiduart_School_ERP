import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "#config/index.js";
import logger from "#config/logger.js";
import { ROLES } from "#shared/constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT],
      required: true,
    },
    schoolId: { type: String, required: true },
    profile: {
      name: { type: String, required: true },
      phone: { type: String },
      department: { type: String }, // For STAFF
      classId: { type: String }, // For STUDENT
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Unique index per school
userSchema.index({ email: 1, schoolId: 1 }, { unique: true });

// Password hashing
userSchema.pre("save", async function (next) {
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
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
