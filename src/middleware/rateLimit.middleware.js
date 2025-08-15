import rateLimit from "express-rate-limit";
import logger from "#config/logger.js";

// Rate limiter configuration
const rateLimitMiddleware = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // Max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: async () => ({
    status: 429,
    message: "Too many requests, please try again later",
  }),
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded for ${req.ip} on ${req.method} ${req.url}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

// TODO: Add custom key generator for user-based rate limiting (e.g., based on req.user.id)

export default rateLimitMiddleware;
