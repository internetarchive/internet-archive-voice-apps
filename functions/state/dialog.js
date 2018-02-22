const _ = require('lodash');

const {getData, setData} = require('./helpers').group('dialog');

/**
 * save last phrase, could we useful in case of repetition
 *
 * @param app
 * @param phrase
 */
function savePhrase (app, phrase) {
  setData(app, Object.assign({}, getData(app), {
    lastPhrase: phrase,
  }));
}

function getLastSpeech (app) {
  return _.at(getData(app), 'lastPhrase.speech')[0];
}

/**
 * get the last told phrase
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastPhrase (app) {
  return _.at(getData(app), 'lastPhrase')[0];
}

/**
 * get the last reprompt
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastReprompt (app) {
  return _.at(getData(app), 'lastPhrase.reprompt')[0];
}

/**
 * get the last suggestions
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastSuggestions (app) {
  return _.at(getData(app), 'lastPhrase.suggestions')[0];
}

module.exports = {
  getLastPhrase,
  getLastReprompt,
  getLastSpeech,
  getLastSuggestions,
  savePhrase,
};
