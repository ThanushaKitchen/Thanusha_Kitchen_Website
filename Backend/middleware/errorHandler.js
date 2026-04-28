// ============================================================
//  middleware/errorHandler.js
//  Global error handler — catches any unhandled errors and
//  sends a clean JSON response instead of crashing the server.
// ============================================================

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Send a clean error response — never expose internal details in production
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message                       // Show full error in development
      : 'Something went wrong. Please try again.'  // Hide details in production
  });
};

module.exports = errorHandler;
