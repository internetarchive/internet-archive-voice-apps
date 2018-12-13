const feeders = require('../../extensions/feeders/index');
const { debug, warning } = require('../../utils/logger/index')('ia:actions:middlewares:feeder-from-slots-scheme');

/**
 * Get feeder from slots scheme
 */
module.exports = () => ctx => {
  debug('start');
  const { slotScheme } = ctx;
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
    return Promise.reject(ctx);
  }
  return Promise.resolve(Object.assign({}, ctx, { feeder, feederName }));
};
