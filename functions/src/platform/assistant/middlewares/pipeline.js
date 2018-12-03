const pipeline = require('../../../performance/pipeline');

/**
 * Log pipeline
 */
module.exports = {
  start: () => {
    pipeline.stage(pipeline.PROCESS_REQUEST);
  },

  finish: () => {
    pipeline.stage(pipeline.IDLE);
  },
};
