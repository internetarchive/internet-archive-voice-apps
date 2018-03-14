const path = require('path');

module.exports = {
  /**
   * Strip file name from full path to get the name of action
   *
   * @param filename {string}
   * @returns {string}
   */
  actionNameByFileName: filename =>
    path.basename(filename, path.extname(filename)),
};
