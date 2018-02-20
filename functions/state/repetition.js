const _ = require('lodash');
const {getData, setData} = require('./helpers').group('repetition');

/**
 * store current action
 *
 * @param app {object}
 * @param action {string} name of action
 */
function storeAction (app, action) {
  setData(app, Object.assign({}, getData(app), {
    action,
  }));
}

/**
 * get repetition action
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastAction (app) {
  return _.at(getData(app), 'action')[0];
}

module.exports = {
  getLastAction,
  storeAction,
};
