const axios = require('axios');
const debug = require(`debug`)(`ia:uploader:agent:debug`);
const error = require(`debug`)(`ia:uploader:agent:error`);
const fs = require('fs');
const unzip = require(`unzip`);
const util = require(`util`);
const { exec } = require('child-process-promise');

fetchAgentFromDF();

function fetchAgentFromDF () {
  return getAccessToken()
    .then(accesstoken => {
      return axios('https://dialogflow.googleapis.com/v2/projects/project_id/agent:export?access_token=' + accesstoken, {method: `POST`});
    })
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data.response.agentContent, false, null));
      return base64Decode(data.response.agentContent, 'agent.zip');
    })
    .then(isDone => {
      fs.createReadStream('agent.zip').pipe(unzip.Extract({ path: './dynamic_agent' }));
      return Promise.resolve('Done');
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${JSON.stringify(e)}`);
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

// function to encode file data to base64 encoded string
// function base64Encode(file) {
// read binary data
// var bitmap = fs.readFileSync(file);
// convert binary data to base64 encoded string
// return new Buffer(bitmap).toString('base64');
// }

// function to create file from base64 encoded string
function base64Decode (base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  var bitmap = Buffer.alloc()(base64str, 'base64');
  // write buffer to file
  fs.writeFileSync(file, bitmap);
  debug('******** File created from base64 encoded string ********');
  return true;
}

// convert image to base64 encoded string
// var base64str = base64_encode('kitten.jpg');
// debug(base64str);
// convert base64 string back to image
// base64_decode(base64str, 'copy.jpg');

module.exports = {
  fetchAgentFromDF,
};
