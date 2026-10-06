// Custom error class so controllers can throw a shaped, HTTP-aware error.
class ApiError extends Error {
  constructor(statusCode, code, message, detail = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.detail = detail;
  }
}

// One consistent error-body schema for the whole API:
// { error: { code, message, detail } }
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        detail: err.detail ?? null
      }
    });
  }

  // Mongoose "CastError" -> malformed ObjectId in a URL param, treat as 400
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: `Invalid identifier: ${err.value}`,
        detail: null
      }
    });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      detail: null
    }
  });
}

// Wrap async controller functions so thrown/rejected errors reach errorHandler
// without a try/catch block in every single controller.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { ApiError, errorHandler, asyncHandler };