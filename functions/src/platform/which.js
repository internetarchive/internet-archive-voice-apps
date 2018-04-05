/**
 * Which platform
 *
 * @returns {String}
 */
module.exports = () => {
  if (process.env.X_GOOGLE_GCLOUD_PROJECT) {
    return 'assistant';
  } else {
    return 'alexa';
  }
};
