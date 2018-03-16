/**
 * All selectors are here
 *
 * Selectors
 * - chooseone option becase on passed context
 *
 */

const builder = require('../../extensions/builder');

const extensions = builder.build({root: __dirname});

const find = (options, context) =>
  extensions.find(e => e.support(options, context));

const process = (options, context) => {
  const extension = find(options, context);
  return extension && extension.process(options, context);
};

module.exports = Object.assign({}, extensions, {
  process,
});
