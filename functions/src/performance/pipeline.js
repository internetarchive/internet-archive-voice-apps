let currentStage = null;
let currentStageTimer = null;

const {timer} = require('../utils/logger')('ia:performance:pipeline');

/**
 * Track stages of pipeline, and thier performance
 *
 * @param newStage
 */
function stage (newStage) {
  if (currentStage === newStage) {
    return;
  }

  if (currentStageTimer) {
    currentStageTimer();
  }

  currentStage = newStage;
  currentStageTimer = timer.start(currentStage);
}

module.exports = {
  /**
   * enum stages
   */
  // wait for the next request
  IDLE: 'idle',
  // process income request
  PROCESS_REQUEST: 'process request',
  // boot stage of the app
  START: 'start',

  stage,
};
