const debug = require('debug')('ia:extensions:debug');
const warning = require('debug')('ia:extensions:warning');

const path = require('path');

/**
 * Builder for pluggable extension
 *
 * TODO:
 * 1. support default extension
 */

class Extensions {
  constructor ({root} = {}) {
    this.root = root;
  }

  getAllExtensions () {

  }

  /**
   * Get extension by its name
   *
   * @param name
   * @returns {*}
   */
  getByName (name) {
    debug('try to get extension:', name);
    // TODO: maybe we should use require.resolve here?
    const location = path.join(this.root, name + '.js');
    try {
      return require(location);
    } catch (error) {
      warning(`can't find module:`, name);
      if (error && error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
      return null;
    }
  }
}

function build (ops) {
  return new Extensions(ops);
}

module.exports = {
  build,
};
