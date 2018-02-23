const debug = require('debug')('ai:actions:select-collection:debug');

const dialog = require('../dialog');
const collection = require('../provider/collection');

function handler (app) {
  debug(`Start handle select collection`);
  const collectionId = app.getArgument('collection');
  return collection.fetchDetails(collectionId)
    .then(details => {
      dialog.ask(app, {
        speech: `Ok you selected ${details.title}.
                 What artist would you like to listen to, e.g.
                 the Grateful Dead, the Ditty Bops, or the cowboy junkies?`,
      });
    });
}

module.exports = {
  handler,
};
