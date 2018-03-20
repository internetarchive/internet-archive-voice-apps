/**
 * Setup application
 */
const dialog = require('./dialog');
const Pipeline = require('./dialog/middlewares/pipeline');
const replaceSpeechIfMuted = require('./dialog/middlewares/replace-speech-if-muted');
const mathjsExtensions = require('./mathjs');

module.exports = () => {
  const pipeline = new Pipeline()
    .use(replaceSpeechIfMuted(require('./strings').dialog.playSong));

  dialog.use(pipeline);

  mathjsExtensions.patch();
};
