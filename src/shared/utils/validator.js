import Joi from "joi";
import logger from "#config/logger.js";
import ApiError from "#shared/utils/apiError.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "#shared/constants/index.js";

/**
 * Validate data against a Joi schema
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {any} data - Data to validate
 * @param {'body'|'query'|'params'} [property='body'] - Request property for middleware usage
 * @returns {any} Validated data
 * @throws {ApiError} If validation fails
 */
export const validate = (schema, data, property = "body") => {
  try {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Collect all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      logger.warn(
        `Validation failed for ${property}: ${JSON.stringify(details)}`,
      );
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.validation_failed,
        details,
      );
    }

    return value;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Validator error for ${property}: ${err.message}`);
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.internal_error,
    );
  }
};

// TODO: Add reusable Joi schemas for common patterns (e.g., email, password)
