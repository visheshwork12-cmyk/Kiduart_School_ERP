import logger from "#config/logger.js";
import ApiError from "#shared/utils/apiError.js";

// Centralized error handling middleware
const errorMiddleware = (error, req, res, next) => {
  // Ensure error is an instance of ApiError
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, "Internal Server Error");

  // Log error details
  logger.error(`${apiError.message} - ${req.method} ${req.url}`, {
    stack: error.stack,
    status: apiError.statusCode,
  });

  // Prepare response
  const response = {
    status: apiError.statusCode,
    message: apiError.message,
  };

  // Include stack trace in development/local environments
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "local"
  ) {
    response.stack = error.stack;
  }

  // Send error response
  res.status(apiError.statusCode).json(response);

  // TODO: Add custom error tracking (e.g., Sentry) for production
};

export default errorMiddleware;
