import ApiError from "#shared/utils/apiError.js";
import { ROLE_HIERARCHY, ROLES } from "#shared/constants/roles.js";
import { HTTP_STATUS } from "#shared/constants/index.js";
import logger from "#config/logger.js";

/**
 * Middleware to authorize requests based on user roles
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...allowedRoles) => {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      logger.warn("Role not found in request");
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Role not found"));
    }

    // Include inherited roles
    const expandedRoles = [userRole, ...(ROLE_HIERARCHY[userRole] || [])];

    // Check if any allowed role is in the user's role hierarchy
    const isAllowed = allowedRoles.some((role) => expandedRoles.includes(role));

    if (!isAllowed) {
      logger.warn(`Access denied for user with role: ${userRole}`);
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, "Insufficient permissions"),
      );
    }

    next();
  };
};

// TODO: Add support for dynamic permission checks based on actions
