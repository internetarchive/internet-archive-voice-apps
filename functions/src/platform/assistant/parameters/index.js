/**
 * Create params layer
 * @param conv
 * @returns {{getParam}}
 */
module.exports = (conv) => ({
  /**
   * get intent param by name
   * @param name {String}
   * @returns {String}
   */
  getByName: (name) => conv.parameters[name] || conv.arguments.get(name),
});
