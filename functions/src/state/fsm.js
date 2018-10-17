/**
 * Finite State Machine (FSM)
 */

const _ = require('lodash');

const { debug } = require('../utils/logger')('ia:state:fsm');

const { getData, setData } = require('./helpers').group('fsm');

/**
 * Select appropriate handler from set available handlers
 *
 * @param app
 * @param {object} handlers
 */
const selectHandler = (app, handlers) => handlers[getState(app)] || handlers.default;

/**
 * Get state of FSM
 *
 * @param app
 * @returns {string} state
 */
const getState = (app) => _.get(getData(app), 'state');

/**
 * Transition from current state to the new one (stateName)
 *
 * @param app
 * @param {string} newState
 */
const transitionTo = (app, newState) => {
  const oldState = getState(app);
  if (oldState === newState) {
    return;
  }

  debug(`transit from "${oldState}" to "${newState}"`);

  setData(app,
    Object.assign({}, getData(app), { state: newState })
  );
};

module.exports = {
  getState,
  selectHandler,
  transitionTo,
};
