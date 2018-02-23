const debug = require('debug')('ai:actions:select-creator:debug');

const dialog = require('../dialog');
const creator = require('../provider/creator');
const querySlots = require('../state/query');

function handler (app) {
  debug(`Start handle select creator`);

  const creatorId = app.getArgument('creator');
  querySlots.setSlot(app, 'creator', creatorId);

  return creator.fetchDetails(creatorId)
    .then(details => {
      // TODO: we could add storage of fetched creator
      // if we will need his details later
      dialog.ask(app, {
        speech: `${details.title} - great choice! Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly from Grateful Dead?`,
      });
    });
}

module.exports = {
  handler,
};
