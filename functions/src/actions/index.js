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

const _ = require('lodash');
const entries = require('object.entries');

const extension = require('../extensions/builder');

const { actionNameByFileName } = require('./_helpers');

/**
 * grab all actions and appropriate states
 *
 * @returns {Array}
 */
function withStates () {
  const res = extension
    .build({ recursive: true, root: __dirname })
    .all()
    .map(({ filename, ext }) => ([actionNameByFileName(filename, __dirname), ext.handler]))
    .filter(action => action[1])
    .reduce((acc, [actionPath, handler]) => {
      const actionName = actionPath.pop();
      _.set(acc, [actionName, ...actionPath, 'default'], handler);
      return acc;
    }, {});

  return new Map(entries(res));
}

module.exports = {
  withStates,
};
