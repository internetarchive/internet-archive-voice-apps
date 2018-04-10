const glob = require('glob');
const path = require('path');

const {debug, warning} = require('../utils/logger')('ia:extensions:builder');

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

  /**
   * All extensions
   */
  all () {
    return glob
      .sync(path.join(this.root, '*.js'))
      .filter(filename => path.basename(filename) !== 'index.js')
      .map(filename => require(filename))
      // skip files without exports
      .filter(ext => typeof ext === 'function' || Object.keys(ext).length > 0);
  }

  /**
   * Get extension by its name (without logging)
   *
   * @param name
   * @returns {*}
   * @private
   */
  _getByName (name) {
    const location = path.join(this.root, name + '.js');
    try {
      return require(location);
    } catch (error) {
      if (error && error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
      return null;
    }
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
    const extension = this._getByName(name);
    if (!extension) {
      warning(`can't find module:`, name);
    }
    return extension;
  }

  /**
   * Do we have extension by name
   *
   * @param name {string}
   * @returns {boolean}
   */
  has (name) {
    return !!this._getByName(name);
  }

  /**
   * Find the first extension which return true for the handler
   *
   * @param handler {function}
   * @return {*}
   */
  find (handler) {
    return this.all()
      .find(e => handler(e)) || null;
  }
}

/**
 * Build Extensions Locator
 * @param ops
 * @returns {Extensions}
 */
function build (ops) {
  return new Extensions(ops);
}

module.exports = {
  build,
};
