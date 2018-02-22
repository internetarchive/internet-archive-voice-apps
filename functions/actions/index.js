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
 * search.artist
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
const {actionNameByFileName} = require('./helpers/handlers');

/**
 * grab all default actions here and return map
 *
 * @returns {Map} map actions to handlers
 */
function defaultActions () {
  const res = glob.sync(path.join(__dirname, '*.js'))
    .map(filename => ([actionNameByFileName(filename), require(filename).handler]))
    .filter(action => action[1]);
  return new Map(res);
}

module.exports = {
  defaultActions,
};
