const logger = require("./logger");

// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error
  logger.error(
    `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Log stack trace for non-production environments
  if (process.env.NODE_ENV !== "production") {
    logger.error(err.stack);
  }

  // Send error response
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// 404 handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
