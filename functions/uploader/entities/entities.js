const axios = require('axios');
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const util = require(`util`);
const { exec } = require('child-process-promise');

const config = require('../config');
const endpointProcessor = require('../../src/network/endpoint-processor');

const MAX_ENTITY = 30000;
const MAX_REQUEST = 10000;

/**
 * Post entities to DialogFlow
 *
 * Maximum 10,000 records per request
 * Maximum 30,000 records per entity
 *
 * @param entityid {string} id of entity in dialogflow
 * @param entities {array}
 * @param first {int} suppose to be 0
 * @returns {Promise}
 */
function postEntitiesToDF (entityid, entities, first) {
  debug(`first : ` + first);
  debug(`Entities Length : ` + entities.length);
  debug(`posting Entity to DF...`);
  if (entities.length > MAX_ENTITY) {
    error(`Can't upload ${entities.length} records in single entity. Maximum allowed limit per entity is ${MAX_ENTITY}.`);
    // return `Can't upload ${entities.length} records in single entity. Maximum allowed limit per entity is ${MAX_ENTITY}.`;
    return Promise.reject(new Error(`Can't upload ${entities.length} records in single entity. Maximum allowed limit per entity is ${MAX_ENTITY}.`));
  }
  var data = [];
  var last = first + MAX_REQUEST;
  if (last > entities.length) {
    last = entities.length;
  }
  if (first >= entities.length) {
    debug(`posted Entity to DF Successfully.`);
    return Promise.resolve({
      'status': {
        'code': 200,
        'errorType': 'success'
      }
    });
  }
  for (let i = first; i < last; i++) {
    data.push({'synonyms': [entities[i]], 'value': entities[i]});
  }
  return getAccessToken()
    .then(accesstoken => {
      debug(util.inspect(accesstoken, false, null));
      return axios(endpointProcessor.preprocess(
        config.dfendpoints.DF_ENTITY_POST_URL,
        {
          entityid,
          accesstoken,
        }
      ), {method: `POST`, body: JSON.stringify({'entities': data})});
    })
    .then(res => res.data)
    .then(data => {
      debug(util.inspect(data, false, null));
      if (data.hasOwnProperty('error') && data.error.code !== 200) {
        return Promise.reject(new Error(data));
      }
      debug(util.inspect(data, false, null));
      debug(`posted Entity to DF Successfully.`);
      first = last;
      return postEntitiesToDF(entityid, entities, first);
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

module.exports = {
  postEntitiesToDF,
  getAccessToken,
};
