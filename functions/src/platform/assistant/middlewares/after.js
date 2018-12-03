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
  handle (conv) {
    this._middlewares.forEach(m => m(conv));
  }
}

module.exports = new Middlewares();
