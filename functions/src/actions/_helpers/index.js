const path = require('path');

module.exports = {
  /**
   * Strip file name from full path to get the name of action
   *
   * @param filename {string}
   * @returns {string}
   */
  actionNameByFileName: (filename, root = path.resolve(__dirname, '..')) =>
    path.relative(root, filename.replace(path.extname(filename), '')).split(path.sep)
};
