const glob = require('glob');
const path = require('path');

/**
 * strip file name from full path
 *
 * @param fullPath
 * @returns {string}
 */
function stripName (fullPath) {
  return path.basename(fullPath, path.extname(fullPath));
}

/**
 * grab all default actions here
 *
 * @returns {Map}
 */
function defaultActions () {
  const res = glob.sync(__dirname + '/*.js')
    .map(filename => ([stripName(filename), require(filename).handler]))
    .filter(action => action[1]);
  return new Map(res);
}

module.exports = {
  defaultActions,
};
