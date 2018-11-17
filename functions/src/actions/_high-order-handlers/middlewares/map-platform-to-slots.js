module.exports = () => ctx => ({
  ...ctx,
  slots: {
    ...ctx.slots,
    platform: ctx.app.platform || 'assistant',
  },
});
