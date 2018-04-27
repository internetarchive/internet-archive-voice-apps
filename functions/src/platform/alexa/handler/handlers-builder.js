const _ = require('lodash');

const {App} = require('../app');
const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const kebabToCamel = require('../../../utils/kebab-to-camel');

const stripAmazonIntentReg = /^AMAZON\.(.*)Intent$/;
function stripAmazonIntent (name) {
  const res = stripAmazonIntentReg.exec(name);
  if (res) {
    return res[1];
  }
  return name;
}

const stripRequestTypeReq = /^AudioPlayer\.(.*)$/;
function stripRequestType (requestType) {
  const req = stripRequestTypeReq.exec(requestType);
  if (req) {
    return req[1];
  }
  return requestType;
}

/**
 * Map actions to alexa handlers
 * - alexa intenets should be camel styled and Object type
 *
 * @param actions {Map}
 * @returns {Object}
 */
module.exports = (actions) => {
  if (!actions) {
    return {};
  }

  return Array
    .from(actions.entries())
    .map(([name, fn]) => {
      const intent = kebabToCamel(name);
      return {
        intent,

        canHandle: (handlerInput) => {
          let intentName = _.get(handlerInput, 'requestEnvelope.request.intent.name');
          if (intentName) {
            // if intent starts with AMAZON we will cut this head
            const newIntentName = stripAmazonIntent(intentName);
            if (intentName !== newIntentName) {
              intentName = newIntentName;
            }
            return intentName === intent;
          }

          let requestType = _.get(handlerInput, 'requestEnvelope.request.type');
          if (requestType) {
            const newRequestType = stripRequestType(requestType);
            if (requestType !== newRequestType) {
              requestType = newRequestType;
            }
            return requestType === intent;
          }

          return false;
        },

        handle: (handlerInput) => {
          debug(`begin handle intent "${intent}"`);
          return handlerInput.attributesManager.getPersistentAttributes()
            .catch((err) => {
              debug('we got error on gettting persistetn attributes', err);
              debug('so we drop them to default');
              return {};
            })
            .then((persistentAttributes) => {
              debug('got persistent attributes:', persistentAttributes);
              return Promise.all([
                persistentAttributes,
                fn(new App(handlerInput, persistentAttributes)),
              ]);
            })
            .then(([persistentAttributes, _]) => {
              handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
              return handlerInput.attributesManager.savePersistentAttributes();
            })
            .then(() => {
              debug(`end handle intent "${intent}"`);
              return handlerInput.responseBuilder.getResponse();
            });
        },
      };
    });
};
