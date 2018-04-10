/**
 * All extensions for Math.js
 */

const builder = require('../extensions/builder');

const extensions = builder.build({root: __dirname});

module.exports = {
  /**
   * Get all extensions and apply patch
   */
  patch: () => {
    extensions.all().forEach(e => e());
  },
};
