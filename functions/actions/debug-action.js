const debug = require('debug')('ia:actions:debug-action:debug');

const dialog = require('../dialog');

/**
 * it is special handler for debug-action
 * which could be mapped for any sequence of words id DialogFlow
 * For example 'debug playlist'
 *
 * @param app
 */
function handler (app) {
  debug(`Start debug action handler`);
  dialog.tell(app,
    `It is example of test debug action. 
    You could make any number of them, and exclude from git.`
  );
}

module.exports = {
  handler,
};
