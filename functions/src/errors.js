class HTTPError extends Error {
  constructor (original) {
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTTPError);
    }

    this.original = original;
  }
}

module.exports = {
  HTTPError,
};
