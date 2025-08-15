/**
 * Custom API Error class for consistent error handling
 * @module apiError
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array.<{field?: string, message: string}>} [details=[]] - Detailed error information
   */
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
