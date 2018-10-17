const _ = require('lodash');

const { getData, setData } = require('./helpers').group('dialog');

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
  return _.get(getData(app), 'lastPhrase.speech');
}

/**
 * get the last told phrase
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastPhrase (app) {
  return _.get(getData(app), 'lastPhrase');
}

/**
 * get the last reprompt
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastReprompt (app) {
  return _.get(getData(app), 'lastPhrase.reprompt');
}

/**
 * get the last suggestions
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastSuggestions (app) {
  return _.get(getData(app), 'lastPhrase.suggestions');
}

/**
 * get reprompt for speech
 *
 * @param app
 * @returns {{reprompt: (undefined|string), speech: Array, suggestions: (undefined|string)}}
 */
const getReprompt = (app) => ({
  reprompt: getLastReprompt(app),
  speech: getLastReprompt(app),
  suggestions: getLastSuggestions(app),
});

module.exports = {
  getLastPhrase,
  getLastReprompt,
  getLastSpeech,
  getLastSuggestions,
  getReprompt,
  savePhrase,
};
