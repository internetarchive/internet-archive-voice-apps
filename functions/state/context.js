const _ = require('lodash');

const getContext = (app) => app.data.context;
const setContext = (app, value) => app.data.context = value;

/**
 * save last phrase, could we useful in case of repetition
 *
 * @param app
 * @param phrase
 */
function savePhrase (app, phrase) {
  setContext(app, Object.assign({}, getContext(app), {
    lastPhrase: phrase,
  }));
}

/**
 * get the last told phrase
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastPhrase (app) {
  return _.at(getContext(app), 'lastPhrase')[0];
}

/**
 * get the last reprompt
 *
 * @param app
 * @returns {undefined|string}
 */
function getLastReprompt (app) {
  return _.at(getContext(app), 'lastPhrase.reprompt')[0];
}

module.exports = {
  getLastPhrase,
  getLastReprompt,
  savePhrase,
};
