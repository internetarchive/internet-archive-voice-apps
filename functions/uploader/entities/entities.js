const fetch = require(`node-fetch`);
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const util = require(`util`);
const mustache = require('mustache');
const config = require('../config');
const MAX_ENTITY = 30000;
const MAX_REQUEST = 1000;

const basicHeaderRequest = {
  'content-type': 'application/json; charset=UTF-8',
  'authorization': 'BEARER DIALOG_FLOW_DEV_TOKEN'
};

// Maximum 1,000 records per request
// Maximum 30,000 records per entity
function postEntitiesToDF (entityname, entities, first) {
  debug(`first : ` + first);
  debug(`Entities Length : ` + entities.length);
  debug(`posting Entity to DF...`);
  if (entities.length > MAX_ENTITY) {
    error(`Can't upload ${entities.length} records in single entity. Maximum allowed limit per entity is ${MAX_ENTITY}.`);
    return `Can't upload ${entities.length} records in single entity. Maximum allowed limit per entity is ${MAX_ENTITY}.`;
  }
  var data = [];
  var last = first + MAX_REQUEST;
  if (last > entities.length) {
    last = entities.length;
  }
  if (first >= entities.length) {
    debug(`posted Entity to DF Successfully.`);
    return;
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
      if (data.status.code !== 200) {
        error(`Error : ` + data.status.errorDetails);
        return;
      }
      debug(util.inspect(data, false, null));
      debug(`posted Entity to DF Successfully.`);
      first = last;
      postEntitiesToDF(entityname, entities, first);
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

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
      console.log(util.inspect(entities, false, null));
      debug(`fetched Entity from DF successfully.`);
      return entities;
    })
    .catch(e => {
      error(`Get error in fetching entity from DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}
function deleteAllEntitiesFromDF (entityname) {
  return Promise.all([
    fetchEntitiesFromDF(entityname),
  ])
    .then(entities => {
      var spliceCreators = entities.splice(0, 1);
      deleteEntitiesFromDF(spliceCreators);
    });
}
function deleteEntitiesFromDF (entities, entityname) {
  return fetch(mustache.render(
    config.dfendpoints.DF_ENTITY_DELETE_URL,
    {
      entityname,
    }
  ), {method: `DELETE`, body: JSON.stringify(entities), headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      debug(`Deleted Entity to dialogflow Successfully.`);
    })
    .catch(e => {
      error(`Get error in deleting entity in DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  postEntitiesToDF,
  fetchEntitiesFromDF,
  deleteAllEntitiesFromDF,
  deleteEntitiesFromDF,
};
