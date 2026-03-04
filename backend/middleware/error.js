// Proper Express Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.stack || err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};
