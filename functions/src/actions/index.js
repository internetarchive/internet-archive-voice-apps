/**
 * In this directory we should add all handler.
 * Handler's file name should match the name of action (intent)
 *
 * For example:
 *
 * - action: welcome
 * - filename: ./actions/welcome.js
 *
 * The way we have some limitations on intent names and recommendations
 * we should use lower case and `-` (dash) as delimiter
 *
 * For example:
 *
 * search-artist
 *
 *
 * Predefined actions in Dialog Flow:
 *
 * - input-unknown
 * - no-input
 *
 */

const glob = require('glob');
const path = require('path');

const extension = require('../extensions/builder');

const {actionNameByFileName} = require('./helpers/handlers');

/**
 * grab all default actions here and return map
 *
 * @returns {Map} map actions to handlers
 */
function defaultActions () {
  const res = glob.sync(path.join(__dirname, '*.js'))
    .map(filename => ([actionNameByFileName(filename)[0], require(filename).handler]))
    .filter(action => action[1]);
  return new Map(res);
}

/**
 * grab all actions and appropriate states
 *
 * @returns {Array}
 */
function withStates () {
  const res = extension
    .build({recursive: true, root: __dirname})
    .all()
    .map(({filename, ext}) => ([actionNameByFileName(filename), ext.handler]))
    .filter(action => action[1])
    .reduce((acc, [filename, handler]) => {
      console.log('filename', filename);
      acc[filename] = {default: handler};
      return acc;
    }, {});
    // .map(([filename, handler]) => ([filename, {default: handler}]));
  return new Map(Object.entries(res));
}

module.exports = {
  defaultActions,
  withStates,
};
