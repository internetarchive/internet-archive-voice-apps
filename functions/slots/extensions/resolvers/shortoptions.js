const humanize = require('../../../humanize');
const {debug, error, warning} = require('../../../utils/logger')('ia:resolver:humanized');

/**
 * Humanize short (maximum 3) list of options
 *
 * @param context
 * @returns {Promise}
 */
function handler (context) {
  debug('start handling');

  // Actually we could use it without Promise
  // but for consistency we wrap Proxy in Promise
  // becaus all the result resolver turns Promise.
  return Promise.resolve(new Proxy({}, {
    get: function (object, name) {
      if (name === 'then') {
        warning('it is not promise');
        return undefined;
      }

      if (name in ['toString', 'valueOf']) {
        return () => `<Proxy of [context]>`;
      }

      if (!(name in context)) {
        warning(`we don't have "${String(name)}" in context`);
        return undefined;
      }

      const value = context[name];
      if (!Array.isArray(value)) {
        error('is not implemented yet!');
        return undefined;
      }

      return humanize.list.toFriendlyString(value.slice(0, 3), {ends: ' or '});
    }
  }));
}

module.exports = {
  handler,
};
