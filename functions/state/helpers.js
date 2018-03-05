const debug = require('debug')('ia:state:debug');

/**
 * Use to build three hierarchy of properties
 */
class SubGroup {
  /**
   *
   * @param {string} name name of the group
   * @param parent
   * @param defaultSubGroup - default value for subgroup
   */
  constructor (name, parent, defaultSubGroup = {}) {
    this.name = name;
    this.parent = parent;
    this.defaultSubGroup = defaultSubGroup;
  }

  getData (app) {
    return this.parent.getData(app)[this.name] || this.defaultSubGroup;
  }

  setData (app, values) {
    this.parent.setData(app,
      Object.assign(
        {},
        this.parent.getData(app),
        {[this.name]: values}
      )
    );
  }
}

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

  SubGroup,
};
