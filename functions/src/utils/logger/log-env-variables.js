const functions = require('firebase-functions');

/**
 * we shouldn't use console
 * but it is trade-off because we can't be sure
 * that process.env will be patched form functions.config correctly
 */
module.exports = () => {
  if (process.env.X_GOOGLE_GCLOUD_PROJECT) {
    console.info(`initial process.env:
                ${JSON.stringify(process.env)}`);
    try {
      console.info(`initial functions.config():
                  ${JSON.stringify(functions.config())}`);
    } catch (err) {
      console.warning('failed to get functions.confg()', err);
    }
  }
};
