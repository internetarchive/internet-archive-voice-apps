const debug = require('debug')('ia:state:debug');

module.exports = {
  /**
   * return getter and setter for sub-group of user's data
   *
   * @param name {string} - name of module
   * @returns {{getData: (function(*)), setData: (function(*, *): *)}}
   */
  group: (name) => ({
    getData: (app) => app.data[name] || {},
    setData: (app, value) => {
      debug(`set user's state ${name} to ${JSON.stringify(value)}`);
      app.data[name] = value;
    },
  }),
};
