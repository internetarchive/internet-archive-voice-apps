/**
 * Finite State Machine (FSM)
 */

const _ = require('lodash');

const {getData, setData} = require('./helpers').group('fsm');

/**
 * Select appropriate handler from set available handlers
 *
 * @param app
 * @param {object} handlers
 */
const selectHandler = (app, handlers) => {

};

/**
 * Get state of FSM
 *
 * @param app
 * @returns {string} state
 */
const getState = (app) => _.get(getData(app), 'state');

/**
 * Set state of FSM
 *
 * @param app
 * @param {string} stateName
 */
const setState = (app, stateName) => setData(app, _.set(getData(app), 'state', stateName));

module.exports = {
  selectHandler,
  getState,
  setState,
};
