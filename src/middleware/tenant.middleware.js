import ApiError from "#shared/utils/apiError.js";
import { HTTP_STATUS } from "#shared/constants/index.js";
import logger from "#config/logger.js";

/**
 * Middleware to resolve tenant ID and attach to request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const tenantMiddleware = (req, res, next) => {
  const tenantId =
    req.user?.schoolId || req.headers["x-tenant-id"] || req.query.tenantId;

  if (!tenantId && req.user?.role !== ROLES.GLOBAL_SUPER_ADMIN) {
    logger.warn("Tenant ID missing for non-global user");
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, "Tenant ID is required"));
  }

  req.tenant = { id: tenantId || null };
  logger.info(`Tenant resolved: ${req.tenant.id || "none"}`);
  next();
};

// TODO: Add validation for tenantId existence in database
