const debug = require('debug')('ia:actions:select-collection:debug');

const dialog = require('../dialog');
const collection = require('../provider/collection');
const querySlots = require('../state/query');

function handler (app) {
  debug(`Start handle select collection`);

  const collectionId = app.getArgument('collection');
  querySlots.setSlot(app, 'collection', collectionId);

  return collection.fetchDetails(collectionId)
    .then(details => {
      // TODO: we could add storage of fetch collection
      // if we will need title of collection later
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
