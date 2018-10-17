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
      let newState;
      if (actionPath.length === 1) {
        newState = { default: handler };
      } else if (actionPath.length === 2) {
        newState = { [actionPath[0]]: handler };
      } else {
        throw new Error(`We got actions which settle out of root or its sub-directories. 
                         What we can't interpret yet.`);
      }

      const actionName = actionPath[actionPath.length - 1];
      acc[actionName] = Object.assign({}, acc[actionName], newState);
      return acc;
    }, {});

  return new Map(entries(res));
}

module.exports = {
  withStates,
};
