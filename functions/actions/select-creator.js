const debug = require('debug')('ia:actions:select-creator:debug');
const mustache = require('mustache');

const dialog = require('../dialog');
const intentStrings = require('../strings').intents.selectCreator;
const prompt = intentStrings.prompts.coverageAndYear;

const collection = require('../provider/collection');
const creator = require('../provider/creator');
const querySlots = require('../state/query');

/**
 * Handle select-creator action
 *
 * @param app
 * @returns {Promise.<TResult>}
 */
function handler (app) {
  debug(`Start handle select creator`);

  const creatorId = app.getArgument('creators');
  debug(`creatorId: ${creatorId}`);

  querySlots.setSlot(app, 'creators', creatorId);

  // TODO: this moment we should be aware what we need here
  // and choose between album and location + year

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

      const suggestions = popular.items
        .slice(0, 3)
        .map((album) => mustache.render(prompt.suggestion, album));

      const state = {
        title: details.title,
        suggestions: suggestions[0],
      };

      const speech = [
        mustache.render(intentStrings.speech, state),
        mustache.render(prompt.speech, state),
      ].join(' ');
      dialog.ask(app, {speech, suggestions});
    });
}

module.exports = {
  handler,
};
