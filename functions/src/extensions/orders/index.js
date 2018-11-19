/**
 * All order strategies
 */
const builder = require('../builder');

module.exports = {
  DEFAULT_ORDER: 'natural',
  orders: builder.build({ root: __dirname }),
};
