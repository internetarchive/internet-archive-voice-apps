const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const fetch = require(`node-fetch`);
const mustache = require('mustache');
const util = require(`util`);

const config = require('../config');

const MAX_ENTITY = 30000;
const MAX_REQUEST = 1000;

const basicHeaderRequest = {
  'content-type': `application/json; charset=UTF-8`,
  'authorization': `BEARER ${process.env.AUTHORIZATION}`
};

// Maximum 1,000 records per request
// Maximum 30,000 records per entity
/**
 * Post entities to DialogFlow
 *
 * @param entityname {string}
 * @param entities {array}
 * @param first {int} suppose to be 0
 * @returns {Promise}
 */
function postEntitiesToDF (entityname, entities, first) {
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
  return fetch(mustache.render(
    config.dfendpoints.DF_ENTITY_POST_URL,
    {
      entityname,
    }
  ), {method: `POST`, body: JSON.stringify(data), headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      if (data.status.code !== 200) {
        error(`Error : ` + data.status.errorDetails);
        return Promise.reject(data);
      }
      debug(util.inspect(data, false, null));
      debug(`posted Entity to DF Successfully.`);
      first = last;
      return postEntitiesToDF(entityname, entities, first);
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

/**
 * Get entities from DialogFlow
 *
 * @param entityname {string}
 * @returns entities {array}
 */
function fetchEntitiesFromDF (entityname) {
  debug(`fetching entity data from DF...`);
  return fetch(mustache.render(
    config.dfendpoints.DF_ENTITY_GET_URL,
    {
      entityname,
    }
  ), {method: `GET`, headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      var entities = [];
      for (var i = 0, len = data.entries.length; i < len; i++) {
        entities.push(data.entries[i].value);
      }
      debug(util.inspect(entities, false, null));
      debug(`fetched Entity from DF successfully.`);
      return entities;
    })
    .catch(e => {
      error(`Get error in fetching entity from DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  postEntitiesToDF,
  fetchEntitiesFromDF,
};
