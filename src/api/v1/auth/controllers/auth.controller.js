import * as authService from "#api/v1/auth/services/auth.service.js";
import {
  successResponse,
  errorResponse,
} from "#shared/utils/responseFormatter.js";
import { validate } from "#shared/utils/validator.js";
import { t } from "#shared/i18n/index.js";
import { HTTP_STATUS, ROLES } from "#shared/constants/roles.js";
import Joi from "joi";
import logger from "#config/logger.js";

/**
 * Joi schema for login request body
 * @type {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  schoolId: Joi.string().optional().allow(null),
});

/**
 * Joi schema for register request body
 * @type {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required(),
  schoolId: Joi.string().when("role", {
    is: [ROLES.SCHOOL_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.STAFF],
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(null),
  }),
});

/**
 * Joi schema for refresh token request body
 * @type {Joi.ObjectSchema}
 */
const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * Handle user login
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const login = async (req, res, next) => {
  try {
    const validatedData = validate(loginSchema, req.body);
    const data = await authService.login(validatedData, req.ip);
    successResponse(
      res,
      data,
      t("auth.loginSuccess", req.language),
      HTTP_STATUS.OK,
    );
  } catch (error) {
    logger.error(`Login controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle user registration
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const register = async (req, res, next) => {
  try {
    const validatedData = validate(registerSchema, req.body);
    const data = await authService.register(
      validatedData,
      req.user || { ip: req.ip },
    );
    successResponse(
      res,
      data,
      t("success.created", req.language),
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    logger.error(`Register controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle token refresh
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const refresh = async (req, res, next) => {
  try {
    const validatedData = validate(refreshSchema, req.body);
    const data = await authService.refresh(validatedData, req.ip);
    successResponse(
      res,
      data,
      t("success.operation_completed", req.language),
      HTTP_STATUS.OK,
    );
  } catch (error) {
    logger.error(`Refresh controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle user logout
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const logout = async (req, res, next) => {
  try {
    const validatedData = validate(refreshSchema, req.body);
    await authService.logout(validatedData, req.ip);
    successResponse(
      res,
      {},
      t("success.operation_completed", req.language),
      HTTP_STATUS.OK,
    );
  } catch (error) {
    logger.error(`Logout controller error: ${error.message}`);
    next(error);
  }
};

// TODO: Add password reset and email verification endpoints
