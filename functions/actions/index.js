const glob = require('glob');
const path = require('path');
const {actionNameByFileName} = require('./helpers/handlers');

/**
 * grab all default actions here
 *
 * @returns {Map}
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
