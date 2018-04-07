const {debug} = require('../../../utils/logger')('ia:platform:assistant:persistance:session');

/**
 * Session level persistance
 *
 * @param app
 */
module.exports = (app) => {
  debug('create');

  if (!app) {
    throw new Error('parameter app should be defined');
  }

  return {
    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData: (name) => {
      if (!app.data) {
        throw new Error('"data" field is missed in app. We can not get user\'s data');
      }

      return app.data[name];
    },

    /**
     * Update data
     *
     * @param name
     * @param value
     */
    setData: (name, value) => {
      debug(`set attribute ${name} to ${JSON.stringify(value)}`);

      if (!app.data) {
        throw new Error('"data" field is missed in app. We can not get user\'s data');
      }

      app.data[name] = value;
    },
  };
};
