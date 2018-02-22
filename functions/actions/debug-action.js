const dialog = require('../dialog');

/**
 * it is special handler for debug-action
 * which could be mapped for any sequence of words id DialogFlow
 * For example 'debug playlist'
 *
 * @param app
 */
function handler(app) {
  dialog.ask(app, {speech: 'We got debug action!'});
}

module.exports = {
  handler,
};
