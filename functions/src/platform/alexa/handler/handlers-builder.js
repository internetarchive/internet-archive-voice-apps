const _ = require('lodash');
const util = require('util');

const {App} = require('../app');
const jsonify = require('../../../utils/jsonify');
const {debug, warning, error} = require('../../../utils/logger')('ia:platform:alexa:handler');

const fsm = require('../../../state/fsm');
const kebabToCamel = require('../../../utils/kebab-to-camel');
const camelToKebab = require('../../../utils/camel-to-kebab');

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
 * @private
 *
 * Fetch persistant attributes
 *
 * @param handlerInput
 * @returns {Promise}
 */
function fetchAttributes (handlerInput) {
  debug('fetch attributes');
  return handlerInput.attributesManager.getPersistentAttributes()
    .catch((err) => {
      warning(
        'We got error on gettting persistetn attributes', err,
        'so we drop them to default'
      );
      return {};
    });
}

/**
 * @private
 *
 * Store persistant attributes
 *
 * @param app
 * @returns {Promise}
 */
function storeAttributes (app, handlerInput) {
  const persistentAttributes = app.persist.getData();
  debug('store attributes', util.inspect(persistentAttributes, {depth: null}));
  handlerInput.attributesManager.setPersistentAttributes(jsonify(persistentAttributes));
  return handlerInput.attributesManager.savePersistentAttributes();
}

/**
 * Find right handlers by user's request input object
 *
 * @param actions
 * @param handlerInput
 *
 * @returns {handlers: *, name:String}|null
 */
function findHandlersByInput (actions, handlerInput) {
  debug('findHandlersByInput');
  let name;
  let handlers;

  name = _.get(handlerInput, 'requestEnvelope.request.intent.name');
  debug('intent name:', name);
  handlers = actions.get(camelToKebab(name));

  if (handlers) {
    return {handlers, name};
  }

  name = stripAmazonIntent(name);
  debug('name without heading amazon:', name);
  handlers = actions.get(camelToKebab(name));

  if (handlers) {
    return {handlers, name};
  }

  let requestType = _.get(handlerInput, 'requestEnvelope.request.type');
  debug('request type', requestType);
  if (requestType) {
    requestType = stripRequestType(requestType);
    debug('just type', requestType);
    handlers = actions.get(camelToKebab(requestType));
    if (handlers) {
      return {handlers, name: requestType};
    }
  }

  const splitName = name.split('_');

  while (splitName.length > 1) {
    debug('splitted name', splitName);
    splitName.pop();
    name = splitName.join('_');
    debug('without tail', name);
    debug('kebab', camelToKebab(name));
    handlers = actions.get(camelToKebab(name));
    if (handlers) {
      return {handlers, name};
    }
  }

  debug(`haven't found any matched handlers`);

  return null;
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
    .map(([name, handlers]) => {
      const intent = kebabToCamel(name);
      return {
        intent,

        canHandle: (handlerInput) => {
          // we never want failed on user request
          // but all failes should be logged
          try {
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
          } catch (err) {
            error(`canHandler of ${intent} failed with`, err);
          }

          return false;
        },

        handle: (handlerInput) => {
          debug(`begin handle intent "${intent}"`);
          return fetchAttributes(handlerInput)
            .then((persistentAttributes) => {
              debug('got persistent attributes:', util.inspect(persistentAttributes, {depth: null}));
              const app = new App(handlerInput, persistentAttributes);
              const handler = fsm.selectHandler(app, handlers);
              return Promise.all([app, handler(app)]);
            })
            // TODO: maybe we could store and response in the same time?
            .then(([app, res]) => storeAttributes(app, handlerInput))
            .then(() => {
              debug(`end handle intent "${intent}"`);
              return handlerInput.responseBuilder.getResponse();
            });
        },
      };
    })
    // it would catcha any intents
    // TODO: 1) actually we could use this handler to handle all intents
    // and replace handlers above
    // 2) we should implement fallback in case when we haven't matched any intent
    .concat({
      intent: 'any',

      canHandle: () => true,

      handle: (handlerInput) => {
        debug('catch all the rest');

        let handlers;
        let name;

        const res = findHandlersByInput(actions, handlerInput);
        if (!res) {
          warning(`we haven't found any valid handler`);
          handlers = {
            default: require('../../../actions/unhandled').handler,
          };
          name = 'unknown intent';
        } else {
          handlers = res.handlers;
          name = res.name;
        }

        debug(`begin handle intent "${name}"`);
        return fetchAttributes(handlerInput)
          .then((persistentAttributes) => {
            debug('got persistent attributes:', util.inspect(persistentAttributes, {depth: null}));
            const app = new App(handlerInput, persistentAttributes);
            const handler = fsm.selectHandler(app, handlers);
            return Promise.all([app, handler(app)]);
          })
          // TODO: maybe we could store and response in the same time?
          .then(([app, res]) => storeAttributes(app, handlerInput))
          .then(() => {
            debug(`end handle intent "${name}"`);
            return handlerInput.responseBuilder.getResponse();
          });
      },
    });
};
