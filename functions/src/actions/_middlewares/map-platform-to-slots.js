const { debug } = require('../../utils/logger')('ia:middleware:map-platform-to-slots');

/**
 * Expose current platform to the slots
 * @returns {function(*): {slots: {platform: (*|string)}}}
 */
module.exports = () => ctx => {
  debug('start');
  return {
    ...ctx,
    slots: {
      ...ctx.slots,
      platform: ctx.app.platform || 'assistant',
    },
  }
};
