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

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const extension = require('../extensions/builder');
const camelToKebab = require('../utils/camel-to-kebab');

const { actionNameByFileName } = require('./_helpers');

/**
 * grab all actions and appropriate states
 *
 * @returns {Array}
 */
function fromFiles () {
  return extension
    .build({ recursive: true, root: __dirname })
    .all()
    .map(({ filename, ext }) => ([actionNameByFileName(filename, __dirname), ext.handler]))
    .filter(action => action[1])
    .reduce((acc, [actionPath, handler]) => {
      const actionName = actionPath.pop();
      _.set(acc, [actionName, ...actionPath, 'default'], handler);
      return acc;
    }, {});
}

class MissedHandlerBuildError extends Error {}

/**
 * grab actions from json scheme and map to handlers
 *
 * @param json
 * @returns {[string , any]}
 */
function fromJSON (json) {
  if (!json) {
    throw new Error('parameter json is required');
  }

  return Object.entries(json)
    .filter(([actionName, scheme]) => 'action' in scheme)
    .reduce((acc, [actionName, scheme]) => {
      const handlerPath = path.join(__dirname, camelToKebab(scheme.action)) + '.js';
      if (!fs.existsSync(handlerPath)) {
        throw new Error(`we don't have handler file ${handlerPath}`);
      }
      _.set(acc, [actionName, 'default'],
        (app) => {
          // TODO: we should build action only once
          const module = require(handlerPath);
          if (typeof module['build'] !== 'function') {
            throw new MissedHandlerBuildError();
          }
          return module.build(scheme)(app);
        }
      );
      return acc;
    }, {});
}

module.exports = {
  fromFiles,
  fromJSON,
  MissedHandlerBuild: MissedHandlerBuildError,
};
