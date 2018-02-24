const debug = require('debug')('ai:actions:select-creator:debug');
const mustache = require('mustache');

const dialog = require('../dialog');
const thanksStrings = require('../strings').intents.selectCreator;
const stepInStrings = require('../strings').stepIn;

const collection = require('../provider/collection');
const creator = require('../provider/creator');
const querySlots = require('../state/query');

const concertToTitle = (album) => `${album.coverage} ${album.year}`;

function handler (app) {
  debug(`Start handle select creator`);

  const creatorId = app.getArgument('creators');
  debug(`creatorId: ${creatorId}`);

  querySlots.setSlot(app, 'creators', creatorId);

  return Promise.all([
    // we can use collection here because creator collection as well
    // and we could create dedicated provider once we need extra features
    collection.fetchDetails(creatorId),
    // get the most popular album of artist
    creator.fetchAlbums(creatorId, {
      sort: 'downloads+desc',
    }),
  ])
    .then(values => {
      // TODO: we could add storage of fetched creator and they albums
      // if we will need these details later
      const [details, popular] = values;
      const state = {
        title: details.title,
        // join coverage (place) and year
        suggestions: concertToTitle(popular.items[0]),
      };

      const suggestions = popular.items.slice(0, 3)
        .map(concertToTitle);

      // TODO: generate suggestions from popular.items
      const speech = [
        mustache.render(thanksStrings.speech, state),
        // TODO: this moment we should be aware what we need here
        // and choose between album and location + year
        mustache.render(stepInStrings.askForLocationAndYear.speech, state),
      ].join(' ');
      dialog.ask(app, {speech, suggestions});
    });
}

module.exports = {
  handler,
};
