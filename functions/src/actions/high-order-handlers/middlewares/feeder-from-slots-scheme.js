const feeders = require('../../../extensions/feeders');
const {debug, warning} = require('../../../utils/logger')('ia:actions:middlewares:feeder-from-slot-scheme');

/**
 * Get feeder from slots scheme
 */
module.exports = () => (context) => {
  debug('start');
  const {slotScheme} = context;
  // both typing are correct
  const fulfilment = slotScheme.fulfilment || slotScheme.fulfillment;
  let feederName;
  if (typeof fulfilment === 'object' && 'feeder' in fulfilment) {
    feederName = fulfilment.feeder;
  } else {
    feederName = fulfilment;
  }
  debug('feeder name:', feederName);
  const feeder = feeders.getByName(feederName);
  if (!feeder) {
    warning(
      `we need feeder "${feederName}" for fulfillment slot dialog`
    );
    // TODO: should explain rejection
    return Promise.reject(context);
  }
  return Promise.resolve(Object.assign({}, context, {feeder, feederName}));
};
