/**
 * All selectors are here
 *
 * Selectors
 * - chooseone option becase on passed context
 *
 */

const builder = require('../../extensions/builder');
const extensions = builder.build({root: __dirname});

/**
 * Find valid option
 *
 * @private
 * @param options
 * @param context
 * @returns {*}
 */
const find = (options, context) => {
  const ext = extensions.find(e => e.support && e.support(options, context));
  if (ext) {
    return ext;
  }

  // default selector doesn't have support
  return extensions.find(e => !e.support);
};

module.exports = Object.assign({}, extensions, {
  /**
   * Use option from available set according to context
   *
   * @param options {Array|Object}
   * @param context {Object}
   * @returns {*}
   */
  find: (options, context) => {
    if (!Array.isArray(options)) {
      return options;
    }
    const extension = find(options, context);
    return extension && extension.find(options, context);
  },
});
