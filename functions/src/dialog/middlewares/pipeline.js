/**
 * Pipeline of middlewares for processing dialog response
 */
class Pipeline {
  constructor () {
    this.middlewares = [];
  }

  /**
   * Process options through pipeline
   *
   * @param app
   * @param options
   * @returns {*}
   */
  process (app, options) {
    return this.middlewares.reduce((acc, middleware) => {
      return middleware(app, acc);
    }, options);
  }

  /**
   * Use middleware in pipeline
   *
   * @param middleware
   * @returns {Pipeline}
   */
  use (middleware) {
    this.middlewares.push(middleware);
    return this;
  }
}

module.exports = Pipeline;
