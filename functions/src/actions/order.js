const {debug} = require('../utils/logger')('ia:actions:order');

function handler(app) {
  debug('order in context of default state!');
}

module.exports = {
  handler,
};
