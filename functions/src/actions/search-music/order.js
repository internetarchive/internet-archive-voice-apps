const { debug } = require('../../utils/logger')('ia:actions:search-music/order');

const musicQuery = require('../music-query');

async function handler (app) {
  debug('order in context of search music state!');
  const { slotScheme, newValues } = await musicQuery.populateSlots({ app });
  debug('newValues', newValues);
  await musicQuery.processPreset(app, slotScheme, { presetParamName: 'orderBy' });
  return musicQuery.handler(app);
}

module.exports = {
  handler,
};
