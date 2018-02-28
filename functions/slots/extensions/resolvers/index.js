const builder = require('../../../extensions/builder');

/**
 * Here will be all resolvers which would need in templates
 *
 * Usage:
 *
 * template = 'Ok! Lets go with {{__resolvers.creator.title}} band!'
 *
 * as result we ask resolver `creator` to process context
 * and return some values where we'll get `title` and substitute
 * to the result processed template.
 */

module.exports = builder.build({root: __dirname});
