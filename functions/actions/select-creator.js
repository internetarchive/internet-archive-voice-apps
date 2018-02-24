const debug = require('debug')('ai:actions:select-creator:debug');
const mustache = require('mustache');

const dialog = require('../dialog');
const thanksStrings = require('../strings').intents.selectCreator;
const stepInStrings = require('../strings').stepIn;

// we can use collection here because creator collection as well
// and we could create dedicated provider once we need extra features
const collection = require('../provider/collection');
const creator = require('../provider/creator');
const querySlots = require('../state/query');

function handler (app) {
  debug(`Start handle select creator`);

  const creatorId = app.getArgument('creator');
  querySlots.setSlot(app, 'creator', creatorId);

  return Promise.all([
    collection.fetchDetails(creatorId),
    // get the most popular album of artist
    creator.fetchTheMostPopularAlbum(creatorId),
  ])
    .then(values => {
      // TODO: we could add storage of fetched creator and they albums
      // if we will need these details later
      const [details, popular] = values;
      const state = {
        title: details.title,
        suggestions: `${popular.items[0].title} ${popular.items[0].year}`,
      }

      // TODO: generate suggestions from popular.items
      const speech = [
        mustache.render(thanksStrings.speech, state),
        // TODO: this moment we should be aware what we need here
        // and choose between album and location + year
        mustache.render(stepInStrings.askForLocationAndYear.speech, state),
      ].join(' ');
      dialog.ask(app, {speech});
    });
}

module.exports = {
  handler,
};
