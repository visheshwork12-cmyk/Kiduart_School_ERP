import jwt from "jsonwebtoken";
import config from "#config/index.js";
import ApiError from "#shared/utils/apiError.js";
import {
  HTTP_STATUS,
  ROLES,
  TENANT_SCOPED_ROLES,
} from "#shared/constants/roles.js";
import { enforceTenantScopeQuery } from "#services/scope.service.js";
import {
  signAccessToken,
  signRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "#services/token.service.js";
import GlobalAdmin from "#models/superadmin/globalAdmin.model.js";
import SchoolSuperAdmin from "#models/superadmin/schoolSuperAdmin.model.js";
import SchoolAdmin from "#models/superadmin/schoolAdmin.model.js";
import User from "#models/user.model.js";
import logger from "#config/logger.js";

/**
 * Serialize user for JWT payload
 * @param {Object} user - User document
 * @returns {{id: string, role: string, schoolId: string|null}} Serialized user
 */
export const serializeUser = (user) => ({
  id: user._id.toString(),
  role: user.role,
  schoolId: user.schoolId || null,
});

/**
 * Register a new user
 * @param {{email: string, password: string, role: string, schoolId?: string}} userData - User registration data
 * @param {{id: string, role: string, schoolId?: string}} requester - Requesting user
 * @returns {Promise<{accessToken: string, refreshToken: string, role: string}>} Tokens and role
 */
export const register = async (userData, requester) => {
  try {
    const { email, password, role, schoolId } = userData;

    // Validate role creation permissions
    if (
      requester.role !== ROLES.GLOBAL_SUPER_ADMIN &&
      role === ROLES.GLOBAL_SUPER_ADMIN
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Only Global Super Admin can create another Global Super Admin",
      );
    }
    if (
      TENANT_SCOPED_ROLES.includes(role) &&
      requester.role !== ROLES.GLOBAL_SUPER_ADMIN &&
      requester.schoolId !== schoolId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Cannot create users outside your school",
      );
    }
    if (
      [ROLES.SCHOOL_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.STAFF].includes(
        role,
      ) &&
      !schoolId
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "School ID required for this role",
      );
    }

    // Select appropriate model
    let Model;
    if (role === ROLES.GLOBAL_SUPER_ADMIN) {
      Model = GlobalAdmin;
      const existingGlobalAdmin = await Model.findOne({ role });
      if (existingGlobalAdmin) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Only one Global Super Admin is allowed",
        );
      }
    } else if (role === ROLES.SCHOOL_SUPER_ADMIN) {
      Model = SchoolSuperAdmin;
    } else if (role === ROLES.SCHOOL_ADMIN) {
      Model = SchoolAdmin;
    } else {
      Model = User;
    }

    // Check for existing user
    const query = enforceTenantScopeQuery(requester, { email }, schoolId);
    const existingUser = await Model.findOne(query);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User already exists");
    }

    // Create user
    const user = await Model.create({ email, password, role, schoolId });
    const accessToken = signAccessToken(serializeUser(user));
    const refreshToken = await signRefreshToken(
      user._id,
      requester.ip || "unknown",
    );

    return { accessToken, refreshToken, role: user.role };
  } catch (error) {
    logger.error(`Register service error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Registration failed");
  }
};

/**
 * Login user and issue tokens
 * @param {{email: string, password: string, schoolId?: string}} credentials - Login credentials
 * @param {string} ip - Client IP
 * @returns {Promise<{accessToken: string, refreshToken: string, role: string}>} Tokens and role
 */
export const login = async ({ email, password, schoolId }, ip) => {
  try {
    let user;

    // Check GlobalAdmin first if no schoolId
    if (!schoolId) {
      user = await GlobalAdmin.findOne({ email }).select("+password");
    }

    // Check school-scoped models
    if (!user) {
      for (const Model of [SchoolSuperAdmin, SchoolAdmin, User]) {
        user = await Model.findOne({ email, schoolId }).select("+password");
        if (user) break;
      }
    }

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const accessToken = signAccessToken(serializeUser(user));
    const refreshToken = await signRefreshToken(user._id, ip);

    return { accessToken, refreshToken, role: user.role };
  } catch (error) {
    logger.error(`Login service error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(HTTP_STATUS.UNAUTHORIZED, "Login failed");
  }
};

/**
 * Refresh access and refresh tokens
 * @param {{refreshToken: string}} tokenData - Refresh token
 * @param {string} ip - Client IP
 * @returns {Promise<{accessToken: string, refreshToken: string, role: string}>} New tokens and role
 */
export const refresh = async ({ refreshToken }, ip) => {
  try {
    const userId = await getUserFromRefreshToken(refreshToken);
    let user;

    for (const Model of [GlobalAdmin, SchoolSuperAdmin, SchoolAdmin, User]) {
      user = await Model.findById(userId);
      if (user) break;
    }

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid user");
    }

    const newRefreshToken = await rotateRefreshToken(refreshToken, ip);
    const accessToken = signAccessToken(serializeUser(user));

    return { accessToken, refreshToken: newRefreshToken, role: user.role };
  } catch (error) {
    logger.error(`Refresh service error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Token refresh failed");
  }
};

/**
 * Logout user by revoking refresh token
 * @param {{refreshToken: string}} tokenData - Refresh token
 * @param {string} ip - Client IP
 * @returns {Promise<void>}
 */
export const logout = async ({ refreshToken }, ip) => {
  try {
    await revokeRefreshToken(refreshToken, ip);
    logger.info(`User logged out via refresh token`);
  } catch (error) {
    logger.error(`Logout service error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Logout failed");
  }
};

// TODO: Add password reset and email verification logic
