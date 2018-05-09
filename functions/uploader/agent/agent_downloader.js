const fetch = require(`node-fetch`);
const error = require(`debug`)(`ia:uploader:agent:error`);
const unzip = require(`unzip`);
const util = require(`util`);
const { exec } = require('child-process-promise');

const basicHeaderRequest = {
  'content-type': `application/json; charset=UTF-8`,
  'authorization': `BEARER `
};
fetchAgentFromDF();
/**
 * Post entities to DialogFlow
 *
 * Maximum 1,000 records per request
 * Maximum 30,000 records per entity
 *
 * @param entityname {string}
 * @param entities {array}
 * @param first {int} suppose to be 0
 * @returns {Promise}
 */

function fetchAgentFromDF () {
  return getAccessToken()
    .then(accesstoken => {
      return fetch('https://dialogflow.googleapis.com/v2/projects/project_id/agent:export?access_token='+accesstoken, {method: `POST`});
    })
    .then(res => res.json())
    .then(data => {
      console.log('Bimmy'+util.inspect(data.response.agentContent, false, null));
      base64_decode(data.response.agentContent, 'agent.zip');
      return base64_decode(data.response.agentContent, 'agent.zip');;
    })
    .then(isDone => {
      fs.createReadStream('agent.zip').pipe(unzip.Extract({ path: './dynamic_agent' }));
      return Promise.resolve("Done");
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function getAccessToken () {
  console.log('getting access token');
  return exec('gcloud auth print-access-token')
    .then(values => {
      var stdout = values.stdout;
      var stderr = values.stderr;
      if (stdout) {
        var filteredstdout = stdout.replace(/\n$/, '');
        console.log(util.inspect(filteredstdout, false, null));
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


var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
    return true;
}

// convert image to base64 encoded string
//var base64str = base64_encode('kitten.jpg');
//console.log(base64str);
// convert base64 string back to image 
//base64_decode(base64str, 'copy.jpg');

module.exports = {
  fetchAgentFromDF,
};
