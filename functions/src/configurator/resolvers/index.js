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
 *
 * They could be used as fulfillments of Slots
 */

const builder = require('../builder');

module.exports = builder.build({root: __dirname});
