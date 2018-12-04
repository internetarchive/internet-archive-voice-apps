/**
 * For the moment action on google api doesn't support
 * middleware which should runs after handling intent
 *
 * https://github.com/actions-on-google/actions-on-google-nodejs/issues/182
 */

class Middlewares {
  constructor () {
    this._middlewares = [];
  }

  /**
   * store and run after
   *
   * @param middleware
   */
  middleware (middleware) {
    this._middlewares.push(middleware);
  }

  /**
   * run all middlewares
   *
   * @param conv
   */
  async handle (conv) {
    // run consistently
    // but it may have sense to run them in parallel
    // but for that each middleware should have list of dependencies
    // to prevent running them in wrong sequence
    for (const m of this._middlewares) {
      await m(conv);
    }
  }
}

module.exports = new Middlewares();
