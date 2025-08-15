import jwt from "jsonwebtoken";
import config from "#config/index.js";
import Token from "#models/token.model.js";
import ApiError from "#shared/utils/apiError.js";
import { HTTP_STATUS } from "#shared/constants/index.js";
import logger from "#config/logger.js";

/**
 * Sign an access token
 * @param {Object} payload - Token payload
 * @param {string} [expiresIn='15m'] - Token expiration
 * @returns {string} Signed JWT
 */
export const signAccessToken = (
  payload,
  expiresIn = config.jwt.accessExpiresIn,
) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn,
    issuer: config.jwt.issuer,
  });
};

/**
 * Sign a refresh token and store it
 * @param {string} userId - User ID
 * @param {string} createdByIp - Client IP
 * @returns {Promise<string>} Refresh token
 */
export const signRefreshToken = async (userId, createdByIp) => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: config.jwt.issuer,
    });

    await Token.create({
      userId,
      token,
      expiresAt,
      createdByIp,
    });

    return token;
  } catch (error) {
    logger.error(`Refresh token signing error: ${error.message}`);
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to issue refresh token",
    );
  }
};

/**
 * Rotate a refresh token
 * @param {string} oldToken - Old refresh token
 * @param {string} ip - Client IP
 * @returns {Promise<string>} New refresh token
 */
export const rotateRefreshToken = async (oldToken, ip) => {
  try {
    const tokenDoc = await Token.findOne({ token: oldToken, isRevoked: false });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }

    // Revoke old token
    tokenDoc.isRevoked = true;
    const newToken = await signRefreshToken(tokenDoc.userId, ip);
    tokenDoc.replacedByToken = newToken;
    await tokenDoc.save();

    return newToken;
  } catch (error) {
    logger.error(`Refresh token rotation error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Token rotation failed",
        );
  }
};

/**
 * Revoke a refresh token
 * @param {string} token - Refresh token
 * @param {string} ip - Client IP
 * @returns {Promise<void>}
 */
export const revokeRefreshToken = async (token, ip) => {
  try {
    const tokenDoc = await Token.findOne({ token, isRevoked: false });
    if (!tokenDoc) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid refresh token");
    }

    tokenDoc.isRevoked = true;
    tokenDoc.createdByIp = ip;
    await tokenDoc.save();
  } catch (error) {
    logger.error(`Refresh token revocation error: ${error.message}`);
    throw error instanceof ApiError
      ? error
      : new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Token revocation failed",
        );
  }
};

/**
 * Get user from refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<string>} User ID
 */
export const getUserFromRefreshToken = async (token) => {
  try {
    const tokenDoc = await Token.findOne({ token, isRevoked: false });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }

    const payload = jwt.verify(token, config.jwt.refreshSecret);
    return payload.userId;
  } catch (error) {
    logger.error(`Refresh token verification error: ${error.message}`);
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }
};

// TODO: Add token cleanup job for expired/revoked tokens
