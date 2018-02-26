const querySlots = require('../state/query');

/**
 * handle music query action
 * - fill slots of music query
 *
 * @param app
 */
function handler (app) {
  const collectionId = app.getArgument('collection');
  querySlots.setSlot(app, 'collection', collectionId);
}

module.exports = {
  handler,
};
