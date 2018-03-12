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
        if (name in ['toString', 'valueOf']) {
          return () => `<Proxy of [context]>`;
        }

        if ((name in ['inspect', 'then']) || (typeof name === 'symbol')) {
          debug(`we don't have "${String(name)}" in context`);
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
