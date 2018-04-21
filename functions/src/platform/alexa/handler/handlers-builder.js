const _ = require('lodash');

const {App} = require('../app');
const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const kebabToCamel = require('../../../utils/kebab-to-camel');

const stripAmazonIntentReg = /^AMAZON\.(.*)Intent$/;
function stripAmazonIntent (name) {
  const res = stripAmazonIntentReg.exec(name);
  if (!res) {
    return name;
  }
  return res[1];
}

/**
 * Map actions to alexa handlers
 * - alexa intenets should be camel styled and Object type
 *
 * @param actions {Map}
 * @returns {Object}
 */
module.exports = (actions, alexa) => {
  if (!actions) {
    return {};
  }

  return Array
    .from(actions.entries())
    .map(([name, fn]) => {
      const intent = kebabToCamel(name);
      return {
        canHandle: (handlerInput) => {
          let intentName = _.get(handlerInput, 'requestEnvelope.request.intent.name');
          if (intentName) {
            // if intent starts with AMAZON we will cut this head
            const newIntentName = stripAmazonIntent(intentName);
            if (intentName !== newIntentName) {
              debug('cut AMAZON head from intent and tail Intent');
              intentName = newIntentName;
            }
            return intentName === intent;
          }

          return _.get(handlerInput, 'requestEnvelope.request.type') === intent;
        },

        handle: (handlerInput) => {
          debug(`begin handle intent "${intent}"`);
          return Promise.resolve(fn(new App(alexa, handlerInput)))
            .then(res => {
              debug(`end handle intent "${intent}"`);

              // TODO: should return Response
              return res;
            });
        },
      };
    });
};
