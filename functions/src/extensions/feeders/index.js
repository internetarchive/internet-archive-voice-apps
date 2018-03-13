/**
 * All feeders are here.
 *
 * The main task of feeders to support playlist.
 * In particular:
 * - fill it with new items (songs)
 * - get current
 * - move to the next
 * - fetch asyncy new data
 *
 * They could be used as fulfillments of Slots
 */

const builder = require('../builder');

module.exports = builder.build({root: __dirname});
