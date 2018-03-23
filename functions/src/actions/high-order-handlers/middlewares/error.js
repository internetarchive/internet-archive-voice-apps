/**
 * Error in middleware
 * should provide context
 * and reason of error
 */
class MiddlewareError extends Error {
  constructor (context, reason) {
    // TODO: construct message
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MiddlewareError);
    }
    this.context = context;
    this.reason = reason;
  }
}

module.exports = {
  MiddlewareError,
};
