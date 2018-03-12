const humanize = require('../../../humanize/list');
const {debug, warning} = require('../../../utils/logger')('ia:resolver:humanized');

/**
 * Resolve
 *
 * @param context
 * @returns {Proxy}
 */
function handler (context) {
  debug('start handling');
  return new Proxy({}, {
    get: function (object, name) {
      if (!(name in context)) {
        warning(`we don't have "${String(name)}" in context`);
        return null;
      }
      return humanize.toFriendlyString(context[name]);
    }
  });
}

module.exports = {
  handler,
};
