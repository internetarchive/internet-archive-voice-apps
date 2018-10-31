const mustache = require('mustache');
const path = require('path');

module.exports = {
  /**
   * Strip file name from full path to get the name of action
   *
   * @param filename {string}
   * @returns {string}
   */
  actionNameByFileName: (filename, root = path.resolve(__dirname, '..')) =>
    path.relative(root, filename.replace(path.extname(filename), '')).split(path.sep),

  /**
   * Substitute context to scheme
   *
   * @param scheme
   * @param ctx
   * @returns {{speech: *}}
   */
  substitute: (scheme, ctx) => ({
    speech: mustache.render(scheme.speech, ctx),
  }),
};
