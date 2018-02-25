const debug = require('debug')('ia:state:debug');

module.exports = {
  /**
   * Construct getter and setter for sub-group of user's data
   *
   * @param name {string} - name of module
   * @returns {{getData: (function(*)), setData: (function(*, *): *)}}
   */
  group: (name) => ({
    /**
     * Get group of user's data
     *
     * @param {Object} app
     * @returns {{}}
     */
    getData: (app) => {
      if (typeof app === 'string') {
        throw new Error(`Argument 'app' should be DialogflowApp object but we get ${app}`);
      }
      if (!app.data) {
        throw new Error('"data" field is missed in app. We can not get user\'s data');
      }
      return app.data[name] || {};
    },

    /**
     * Update group of user's data
     *
     * @param {Object} app
     * @param {Object} value
     */
    setData: (app, value) => {
      debug(`set user's state ${name} to ${JSON.stringify(value)}`);
      if (typeof app === 'string') {
        throw new Error(`Argument 'app' should be DialogflowApp object but we get ${app}`);
      }
      if (!app.data) {
        throw new Error('"data" field is missed in app. We can not get user\'s data');
      }
      app.data[name] = value;
    },
  }),
};
