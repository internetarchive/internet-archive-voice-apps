const _ = require('lodash');
const {getData, setData} = require('./helpers').group('repetition');

/**
 * store current action
 *
 * @param app {object}
 * @param action {string} name of action
 */
function storeAction (app, action) {
  if (getLastAction(app) === action) {
    return;
  }

  setData(app, Object.assign({}, getData(app), {
    action,
    count: 0,
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

/**
 * store action count
 *
 * @param count
 */
function storeRepetitionCount(app, count) {
  setData(app, Object.assign({}, getData(app), {
    count,
  }));
}

/**
 * get last action count
 * @returns {*}
 */
function getLastRepetitionCount(app) {
  return _.at(getData(app), 'count')[0];
}

module.exports = {
  getLastAction,
  storeAction,
  getLastRepetitionCount,
  storeRepetitionCount,
};
