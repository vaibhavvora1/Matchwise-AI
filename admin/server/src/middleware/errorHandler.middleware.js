/**
 * Global centralized error handling middleware for Admin Server.
 * Prevents stack traces and sensitive error internals from leaking in production.
 */
export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  console.error("[Admin Server Error]:", err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.isOperational || !isProduction
      ? err.message || "An unexpected error occurred."
      : "Internal server error. Please try again later.";

  const code = err.code || "INTERNAL_SERVER_ERROR";

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(isProduction ? {} : { stack: err.stack, details: err.details }),
  });
};

export default errorHandler;
