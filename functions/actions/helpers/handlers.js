const path = require('path');

/**
 * Strip file name from full path to get the name of action
 *
 * @param filename
 * @returns {string}
 */
const actionNameByFileName = (filename) =>
  path.basename(filename, path.extname(filename));

module.exports = {
  /**
   * check is it handler of the action
   *
   * @param filename {string} path to the handler
   * @param action {string}
   * @returns {boolean}
   */
  isItHandlerOfAction: (filename, action) => {
    return actionNameByFileName(filename) === action;
  },

  actionNameByFileName,
};
