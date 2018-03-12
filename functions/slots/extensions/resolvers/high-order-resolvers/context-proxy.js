const _ = require('lodash');

const {debug, error, warning} = require('../../../../utils/logger')('ia:resolver:hor:context-proxy');

module.exports = (processing) => {
  /**
   * Wrap to proxy context to preprocess each requested property
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
        if (_.includes(['toString', 'valueOf'], name)) {
          return () => `<Proxy of [context]>`;
        }

        if (_.includes(['inspect', 'then'], name) || (typeof name === 'symbol')) {
          // those message usually is not important
          // because are fired on Promise resolving and logging
          return undefined;
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

        return processing(value);
      }
    }));
  }

  return handler;
};
