const debug = require(`debug`)(`ia:uploader:utils:get-access-token:debug`);
const error = require(`debug`)(`ia:uploader:utils:get-access-token:error`);
const util = require(`util`);
const { exec } = require('child-process-promise');

function getBasicHeaderRequest () {
  return getAccessToken()
    .then(accessToken => {
      const basicHeaderRequest = {
        'content-type': `application/json; charset=UTF-8`,
        'authorization': `BEARER ${accessToken}`
      };
      return Promise.resolve(basicHeaderRequest);
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${util.inspect(e, false, null)}`);
      return Promise.reject(e);
    });
}

function getAccessToken () {
  debug('getting access token');
  return exec('gcloud auth print-access-token')
    .then(values => {
      var stdout = values.stdout;
      var stderr = values.stderr;
      if (stdout) {
        var filteredstdout = stdout.replace(/\n$/, '');
        debug(util.inspect(filteredstdout, false, null));
        return Promise.resolve(filteredstdout);
      } else if (stderr) {
        error(stderr);
        return Promise.reject(new Error('ERROR: ' + stderr));
      } else {
        error('Having trouble with GCloud execution');
        return Promise.reject(new Error('ERROR: Having trouble with GCloud execution'));
      }
    });
}

module.exports = {
  getBasicHeaderRequest,
  getAccessToken,
};
