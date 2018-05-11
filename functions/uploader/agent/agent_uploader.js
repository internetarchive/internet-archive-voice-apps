const debug = require(`debug`)(`ia:uploader:agent:agent_uploader:debug`);
const error = require(`debug`)(`ia:uploader:agent:agent_uploader:error`);
const fetch = require(`node-fetch`);
const util = require(`util`);
const { exec } = require('child-process-promise');
const {prepareAgentToPostToDF} = require('../utils/prepare_agent');

postAgentToDF();

function postAgentToDF () {
  return Promise.all([getAccessToken(), prepareAgentToPostToDF('my_agent', './')])
    .then(values => {
      const [accesstoken, base64] = values;
      return fetch('https://dialogflow.googleapis.com/v2/projects/music-a88c1/agent:import?access_token=' + accesstoken, {method: `POST`, body: JSON.stringify({'agentContent': base64})});
    })
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
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
  postAgentToDF,
};
