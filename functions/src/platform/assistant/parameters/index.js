/**
 * Create params layer
 * @param ctx
 */
module.exports = (ctx) => ({
  /**
   * get intent param by name
   * @param name {String}
   * @returns {Object}
   */
  getParam: (name) => ctx.getArgument(name),
});
