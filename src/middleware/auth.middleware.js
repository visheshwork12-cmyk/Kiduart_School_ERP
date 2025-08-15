import passport from "#config/passport.js";
import ApiError from "#shared/utils/apiError.js";
import { HTTP_STATUS } from "#shared/constants/index.js";
import logger from "#config/logger.js";

/**
 * Authenticate JWT and attach user to request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      logger.error(`Auth middleware error: ${err.message}`);
      return next(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Authentication error"),
      );
    }
    if (!user) {
      logger.warn(`Authentication failed: ${info?.message || "No user found"}`);
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token"),
      );
    }
    req.user = user;
    next();
  })(req, res, next);
};

// TODO: Add support for optional httpOnly cookie authentication
