const _ = require('lodash');

const {App} = require('../app');
const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const kebabToCamel = require('../../../utils/kebab-to-camel');

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
        canHandle: (handlerInput) =>
        _.get(handlerInput, 'requestEnvelope.request.intent.name') === intent ||
        _.get(handlerInput, 'requestEnvelope.request.type') === intent,

        handle: (handlerInput) => {
          debug(`begin handle intent "${intent}"`);
          return Promise.resolve(fn(new App(alexa, handlerInput)))
            .then(res => {
              debug(`end handle intent "${intent}"`);

              // TODO: shoule return Response
              return res;
            });
        },
      };
    });
};
