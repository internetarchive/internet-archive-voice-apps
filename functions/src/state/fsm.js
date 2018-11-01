/**
 * Extended Finite State Machine (FSM).
 *
 * Here is FSM with memory.
 * So for getting right state we should consider the history of previous states.
 *
 * We have a history of states and we try to match this sequence to hierarchy of states
 * for example
 * 1) we could have: welcome -> playback -> help -> playback
 * we try to match
 *
 * welcome -> playback -> help -> playback
 *
 * then
 *
 * playback -> help -> playback
 *
 * then
 *
 * help -> playback
 *
 * and finally
 *
 * playback
 *
 * which match our hierarchy
 *
 * if we can't find any we use "default".
 * as well we try to match from a top of hierarchy
 *
 */

const _ = require('lodash');

const { debug } = require('../utils/logger')('ia:state:fsm');

const { getData, setData } = require('./helpers').group('fsm');

// we hold no more than 32 last states
const MAX_DEPTH = 32;

/**
 * Get state of FSM
 *
 * @param app
 * @returns {string} state
 */
const getLastState = (app) => _.last(_.get(getData(app), 'history'));

/**
 * Get state history
 */
const getHistory = (app) => _.get(getData(app), 'history', []);

/**
 * Select appropriate handler from hierarchy of available handlers
 *
 * @param app
 * @param {object} handlers
 */
function selectHandler (app, handlers) {
  let history = getHistory(app);
  while (history.length > 0) {
    const handler = _.get(handlers, history);
    if (handler) {
      // it is not a leaf
      if (typeof handler === 'object') {
        return handler.default;
      }
      return handler;
    }

    history = _.tail(history);
  }

  return handlers.default;
}

/**
 * Transition from current state to the new one (stateName)
 *
 * @param app
 * @param {string} newState
 */
const transitionTo = (app, newState) => {
  const lastState = getLastState(app);
  if (lastState === newState) {
    return;
  }

  debug(`transit from "${lastState}" to "${newState}"`);

  // drop a head to not exceed history limit
  let history = _.takeRight(getHistory(app).concat(newState), MAX_DEPTH);

  setData(app, Object.assign({}, getData(app), { history }));
};

module.exports = {
  getHistory,
  getLastState,
  selectHandler,
  transitionTo,
};
