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

module.exports = {
  getLastPhrase,
  getLastReprompt,
  savePhrase,
};
