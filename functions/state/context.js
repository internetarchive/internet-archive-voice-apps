/**
 * save last phrase, could we useful in case of repetition
 *
 * @param app
 * @param phrase
 */
function savePhrase (app, phrase) {
  app.data.context = app.data.context || {};
  app.data.context.lastPhrase = phrase;
}

/**
 * get the last told phrase
 *
 * @param app
 * @returns {*}
 */
function getLastPhrase(app) {
  return app.data && app.data.context && app.data.context.lastPhrase;
}

module.exports = {
  getLastPhrase,
  savePhrase,
};
