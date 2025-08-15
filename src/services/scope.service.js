import { ROLES, TENANT_SCOPED_ROLES } from "#shared/constants/roles.js";
import logger from "#config/logger.js";

/**
 * Expand user scope based on role and requested tenant
 * @param {{id: string, role: string, schoolId?: string}} user - User data
 * @param {string} [requestedTenantId] - Requested tenant ID
 * @returns {{isGlobal: boolean, schoolId: string|null}} Resolved scope
 */
export const expandUserScope = (user, requestedTenantId) => {
  const isGlobal = user.role === ROLES.GLOBAL_SUPER_ADMIN;
  let schoolId = null;

  if (isGlobal) {
    schoolId = requestedTenantId || null;
  } else if (TENANT_SCOPED_ROLES.includes(user.role)) {
    schoolId = user.schoolId;
  }

  return { isGlobal, schoolId };
};

/**
 * Enforce tenant scope on database queries
 * @param {{id: string, role: string, schoolId?: string}} user - User data
 * @param {Object} [baseQuery={}] - Base query object
 * @param {string} [requestedTenantId] - Requested tenant ID
 * @returns {Object} Scoped query
 */
export const enforceTenantScopeQuery = (
  user,
  baseQuery = {},
  requestedTenantId,
) => {
  if (user.role === ROLES.GLOBAL_SUPER_ADMIN) {
    return requestedTenantId
      ? { ...baseQuery, schoolId: requestedTenantId }
      : baseQuery;
  }
  if (TENANT_SCOPED_ROLES.includes(user.role)) {
    if (!user.schoolId) {
      logger.warn(`School ID missing for user with role: ${user.role}`);
      throw new Error("School ID required for this role");
    }
    return { ...baseQuery, schoolId: user.schoolId };
  }
  return baseQuery;
};

// TODO: Add department/grade-level scoping for SCHOOL_ADMIN
