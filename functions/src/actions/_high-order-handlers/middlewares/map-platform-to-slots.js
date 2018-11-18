/**
 * Expose current platform to the slots
 * @returns {function(*): {slots: {platform: (*|string)}}}
 */
module.exports = () => ctx => ({
  ...ctx,
  slots: {
    ...ctx.slots,
    platform: ctx.app.platform || 'assistant',
  },
});
