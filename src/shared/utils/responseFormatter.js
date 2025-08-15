import { HTTP_STATUS } from "#shared/constants/index.js";

/**
 * Format a successful API response
 * @param {import('express').Response} res - Express response object
 * @param {any} [data={}] - Response payload
 * @param {string} [message='Success'] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {import('express').Response} Formatted response
 */
export const successResponse = (
  res,
  data = {},
  message = "Success",
  statusCode = HTTP_STATUS.OK,
) => {
  return res.status(statusCode).json({
    status: "success",
    statusCode,
    message,
    data,
  });
};

/**
 * Format an error API response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Error'] - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array.<{field?: string, message: string}>} [details=[]] - Detailed error information
 * @returns {import('express').Response} Formatted response
 */
export const errorResponse = (
  res,
  message = "Error",
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details = [],
) => {
  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    details,
  });
};

// TODO: Add support for custom metadata (e.g., requestId, pagination info)
