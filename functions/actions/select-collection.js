const debug = require('debug')('ai:actions:select-collection:debug');

const dialog = require('../dialog');

function handler (app) {
  debug(`Start handle select collection`);
  dialog.ask(app, {
    speech: `Ok you selected ${app.getArgument('collection')}.
             What artist would you like to listen to, e.g.
             the Grateful Dead, the Ditty Bops, or the cowboy junkies?`,
  });
}

module.exports = {
  handler,
};
