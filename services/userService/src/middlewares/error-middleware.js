const logger = require("../config/logger");
const { formatResponse } = require("../utils/response");

/**
 * Error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error
  logger.error(
    `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json(formatResponse(false, null, err.message));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res
      .status(400)
      .json(formatResponse(false, null, "Duplicate field value entered"));
  }

  // Send error response
  res
    .status(statusCode)
    .json(
      formatResponse(
        false,
        null,
        process.env.NODE_ENV === "production" ? "Server Error" : err.message
      )
    );
};

module.exports = errorMiddleware;
