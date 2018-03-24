/**
 * Setup application
 */
const mathjsExtensions = require('./mathjs');

module.exports = () => {
  mathjsExtensions.patch();
};
