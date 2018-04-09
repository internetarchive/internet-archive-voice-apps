/**
 * Create params layer
 * @param ctx
 * @returns {{getParam}}
 */
module.exports = (ctx) => ({
  /**
   * get intent param by name
   * @param name {String}
   * @returns {String}
   */
  getByName: (name) => ctx.getArgument(name),
});
