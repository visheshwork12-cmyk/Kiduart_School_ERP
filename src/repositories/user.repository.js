import GlobalAdmin from "#models/superadmin/globalAdmin.model.js";
import SchoolSuperAdmin from "#models/superadmin/schoolSuperAdmin.model.js";
import SchoolAdmin from "#models/superadmin/schoolAdmin.model.js";
import User from "#models/user.model.js";
import { enforceTenantScopeQuery } from "#services/scope.service.js";
import logger from "#config/logger.js";
import { ROLES } from "#shared/constants/roles.js";

/**
 * Find Global Super Admin by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User document
 */
export const findGlobalAdminByEmail = async (email) => {
  try {
    return await GlobalAdmin.findOne({ email }).select("+password");
  } catch (error) {
    logger.error(`Find global admin error: ${error.message}`);
    throw error;
  }
};

/**
 * Find School Super Admin by email and schoolId
 * @param {string} email - User email
 * @param {string} schoolId - School ID
 * @returns {Promise<Object|null>} User document
 */
export const findSchoolSuperAdminByEmail = async (email, schoolId) => {
  try {
    return await SchoolSuperAdmin.findOne({ email, schoolId }).select(
      "+password",
    );
  } catch (error) {
    logger.error(`Find school super admin error: ${error.message}`);
    throw error;
  }
};

/**
 * Find scoped user by email, role, and schoolId
 * @param {string} email - User email
 * @param {string} role - User role
 * @param {string} schoolId - School ID
 * @returns {Promise<Object|null>} User document
 */
export const findScopedUserByEmail = async (email, role, schoolId) => {
  try {
    const Model = role === ROLES.SCHOOL_ADMIN ? SchoolAdmin : User;
    return await Model.findOne({ email, role, schoolId }).select("+password");
  } catch (error) {
    logger.error(`Find scoped user error: ${error.message}`);
    throw error;
  }
};

/**
 * Find user by ID across all models
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User document
 */
export const findUserById = async (userId) => {
  try {
    for (const Model of [GlobalAdmin, SchoolSuperAdmin, SchoolAdmin, User]) {
      const user = await Model.findById(userId);
      if (user) return user;
    }
    return null;
  } catch (error) {
    logger.error(`Find user by ID error: ${error.message}`);
    throw error;
  }
};

/**
 * Create a user in the appropriate model
 * @param {{email: string, password: string, role: string, schoolId?: string}} userData - User data
 * @param {{id: string, role: string, schoolId?: string}} requester - Requesting user
 * @returns {Promise<Object>} Created user document
 */
export const createUser = async (userData, requester) => {
  try {
    const { email, password, role, schoolId } = userData;
    const Model =
      role === ROLES.GLOBAL_SUPER_ADMIN
        ? GlobalAdmin
        : role === ROLES.SCHOOL_SUPER_ADMIN
          ? SchoolSuperAdmin
          : role === ROLES.SCHOOL_ADMIN
            ? SchoolAdmin
            : User;

    const query = enforceTenantScopeQuery(requester, { email }, schoolId);
    const existingUser = await Model.findOne(query);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User already exists");
    }

    return await Model.create({ email, password, role, schoolId });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    throw error;
  }
};

// TODO: Add methods for updating/deleting users with scope enforcement
