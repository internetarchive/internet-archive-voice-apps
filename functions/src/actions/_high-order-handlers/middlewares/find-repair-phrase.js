const _ = require('lodash');
const util = require('util');

const selectors = require('../../../configurator/selectors');
const { debug, warning } = require('../../../utils/logger')('ia:actions:middlewares:find-repair-phrase');

const { requiredParameter } = require('./utils');

/**
 * Middleware
 *
 * we got broken slots so should find right repair phrase
 * - we are getting repairing speeches
 *
 * @param repairSlotScheme
 * @param slotScheme
 * @param speech
 *
 * @returns {Promise}
 */
module.exports = () => (ctx) => {
  debug('start');
  const { repairScheme, slotScheme, speech = [] } = ctx;

  requiredParameter(repairScheme, {
    message: 'it seems we have missed repairScheme parameters. ' +
    'Maybe we haven\'t applied findRepairScheme() before to get it or ' +
    'slot scheme doessn\'t have repair phrases section'
  });
  requiredParameter(slotScheme, { message: 'We missed slotScheme parameter' });

  debug('repair speech options:', repairScheme.speech);
  let template = selectors.find(repairScheme.speech, ctx);

  debug('we choice repair phrase:', template);
  if (!template) {
    warning(`can't find repair phrase, should use default`);
    if (!_.has(repairScheme, 'default.speech')) {
      throw new Error(
        `repair scheme "${util.inspect(repairScheme)}" doesn't have default.speech option`
      );
    }
    template = repairScheme.default.speech;
  }

  return Promise.resolve(Object.assign({}, ctx, {
    speech: speech.concat(template)
  }));
};
