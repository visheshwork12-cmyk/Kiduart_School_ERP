import ApiError from '#shared/utils/apiError.js';
import { ROLES, TENANT_SCOPED_ROLES } from '#shared/constants/roles.js';
import { HTTP_STATUS } from '#shared/constants/index.js';
import logger from '#config/logger.js';

/**
 * Middleware to enforce tenant scope
 * @returns {Function} Express middleware function
 */
export const requireTenantScope = () => {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return (req, res, next) => {
    const user = req.user;
    const tenantId = req.tenant?.id;

    if (!user) {
      logger.warn('User not found in scope middleware');
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated'));
    }

    const isGlobal = user.role === ROLES.GLOBAL_SUPER_ADMIN;
    let resolvedSchoolId = null;

    if (isGlobal) {
      resolvedSchoolId = tenantId || null; // Global admin can impersonate any school
    } else if (TENANT_SCOPED_ROLES.includes(user.role)) {
      if (!user.schoolId) {
        logger.warn(`School ID missing for user with role: ${user.role}`);
        return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'School ID required for this role'));
      }
      if (tenantId && tenantId !== user.schoolId) {
        logger.warn(`School ID mismatch: ${tenantId} vs ${user.schoolId}`);
        return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Access restricted to your school'));
      }
      resolvedSchoolId = user.schoolId;
    }

    req.scope = { schoolId: resolvedSchoolId, isGlobal };
    logger.info(`Scope resolved: schoolId=${resolvedSchoolId || 'none'}, isGlobal=${isGlobal}`);
    next();
  };
};

// TODO: Add support for department/grade-level scoping for SCHOOL_ADMIN