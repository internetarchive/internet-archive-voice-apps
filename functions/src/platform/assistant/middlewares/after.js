/**
 * For the moment action on google api doesn't support
 * middleware which should runs after handling intent
 *
 * https://github.com/actions-on-google/actions-on-google-nodejs/issues/182
 */
module.exports = {
  /**
   * run middleware after handling intent
   * @param middleware
   */
  middleware (middleware) {
    // TODO: store and run after
  },

  handle (conv) {
    // TODO: run all middlewares
  },
};
