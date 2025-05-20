const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(
    `${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  logger.error(err.stack);

  // Default error status and message
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong";
  let status = err.status || "error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    status = "fail";
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `Duplicate field value: ${Object.keys(err.keyValue).join(
      ", "
    )}. Please use another value.`;
    status = "fail";
  }

  // Handle Mongoose cast errors
  if (err.name === "CastError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
    status = "fail";
  }

  // Send error response
  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
