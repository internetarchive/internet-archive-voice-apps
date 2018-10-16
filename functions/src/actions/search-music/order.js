const {debug} = require('../../utils/logger')('ia:actions:search-music/order');

const musicQuery = require('../music-query');

function handler (app) {
  debug('order in context of search music state!');
  const {slotScheme, newValues} = musicQuery.populateSlots(app);
  debug('newValues', newValues);
  musicQuery.processPreset(app, slotScheme, {presetParamName: 'orderBy'});
  return musicQuery.handler(app);
}

module.exports = {
  handler,
};
