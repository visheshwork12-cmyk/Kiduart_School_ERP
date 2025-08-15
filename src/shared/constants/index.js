/**
 * Centralized constants for the application
 * @module constants
 */

/**
 * HTTP status codes
 * @type {Object.<string, number>}
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

/**
 * User roles
 * @type {Object.<string, string>}
 */
export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
  STUDENT: "student",
});

/**
 * Supported languages
 * @type {Object.<string, string>}
 */
export const LANGUAGES = Object.freeze({
  ENGLISH: "en",
  HINDI: "hi",
});

/**
 * Pagination defaults
 * @type {Object.<string, number>}
 */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
});

/**
 * Common error messages
 * @type {Object.<string, string>}
 */
export const ERROR_MESSAGES = Object.freeze({
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  INVALID_INPUT: 'Invalid input provided',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
});

// TODO: Add additional constants (e.g., MAX_FILE_SIZE, CACHE_TTL) as needed
