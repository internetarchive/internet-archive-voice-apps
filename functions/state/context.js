const _ = require('lodash');

/**
 * save last phrase, could we useful in case of repetition
 *
 * @param app
 * @param phrase
 */
function savePhrase (app, phrase) {
  app.data.context = Object.assign({}, app.data.context, {
    lastPhrase: phrase,
  });
}

/**
 * get the last told phrase
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastPhrase (app) {
  return _.at(app, 'data.context.lastPhrase')[0];
}

/**
 * get the last reprompt
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastReprompt (app) {
  return _.at(app, 'data.context.lastPhrase.reprompt')[0];
}

module.exports = {
  getLastPhrase,
  getLastReprompt,
  savePhrase,
};
