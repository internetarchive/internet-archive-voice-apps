/**
 * All resolvers should be here
 *
 * Resolver features:
 *
 * - calculate on-fly new values.
 *   For example: title of collection by its id,
 *   name of artist by it's id and etc
 *
 *
 * They could be used as fulfillments of Slots
 *
 *
 * Usage:
 *
 * template = 'Ok! Lets go with {{creator.title}} band!'
 *
 * in first place we would check whether we have slot with name creator
 * and if we don't have it we'll ask resolver `creator` to process context
 * and return object where we could get `title` and substitute
 * to the result processed template.
 */

const builder = require('../../extensions/builder');

module.exports = builder.build({root: __dirname});
