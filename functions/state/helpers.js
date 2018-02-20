module.exports = {
  /**
   * return getter and setter for sub-group of user's data
   *
   * @param name {string} - name of module
   * @returns {{getData: (function(*)), setData: (function(*, *): *)}}
   */
  group: (name) => ({
    getData: (app) => app.data[name],
    setData: (app, value) => {
      app.data[name] = value;
    },
  }),
};
