const fetch = require(`node-fetch`);
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const util = require(`util`);
const _ = require(`lodash`);
const mustache = require('mustache');
const config = require('../../config');

const basicHeaderRequest = {
  'content-type': 'application/json; charset=UTF-8',
  'authorization': 'BEARER DIALOG_FLOW_DEV_TOKEN'
};
// print process.argv
process.argv.forEach(function (val, index, array) {
  debug(index + ': ' + val);
});

function fetchEntitiesFromIA (id, limit) {
  var page = 0;
  var sort = 'downloads+desc';
  debug(`fetching entity data from IA...`);
  var url = mustache.render(
    config.endpoints.COLLECTION_ITEMS_URL,
    {
      id,
      limit,
      page,
      sort,
      fields: 'creator',
    }
  );
  debug(url);
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      var creatorsJsonArray = data.response.docs;
      var creators = [];
      for (let i = 0; i < creatorsJsonArray.length; i++) {
        var creator = JSON.stringify(creatorsJsonArray[i].creator);
        if (creator) {
          creator = creator.replace(/[^a-zA-Z 0-9]+/g, ` `);
          creators.push(creator);
        }
      }
      creators = _.uniq(creators);
      debug(`fetched Entity from IA successfully.`);
      return creators;
    }).catch(e => {
      error(`Get error in fetching entity from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function fetchNewEntitiesFromIAAndPostToDF (entityname, id, limit) {
  return Promise.all([
    fetchEntitiesFromIA(id, limit),
    fetchEntitiesFromDF(entityname),
  ])
    .then(values => {
      const [creatorsFromIA, creatorsFromDF] = values;
      var dif = _.differenceWith(creatorsFromIA, creatorsFromDF, _.isEqual);
      debug(util.inspect(dif, false, null));
      postEntitiesToDF(entityname, dif, 0);
    });
}

// Maximum 1,000 records per request
// Maximum 30,000 records per entity
function postEntitiesToDF (entityname, creators, first) {
  debug(`first : ` + first);
  debug(`Creators Length : ` + creators.length);
  debug(`posting Entity to DF...`);
  var data = [];
  var maxRequest = 1000;
  var last = first + maxRequest;
  if (last > creators.length) {
    last = creators.length;
  }
  if (first >= creators.length) {
    debug(`posted Entity to DF Successfully.`);
    return;
  }
  for (let i = first; i < last; i++) {
    data.push({'synonyms': [creators[i]], 'value': creators[i]});
  }
  return fetch(mustache.render(
    config.endpoints.DF_ENTITY_POST_URL,
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
      postEntitiesToDF(entityname, creators, first);
    })
    .catch(e => {
      error(`Get error in posting entity to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function fetchEntitiesFromDF (entityname) {
  debug(`fetching entity data from DF...`);
  return fetch(mustache.render(
    config.endpoints.DF_ENTITY_GET_URL,
    {
      entityname,
    }
  ), {method: `GET`, headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      var creators = [];
      for (var i = 0, len = data.entries.length; i < len; i++) {
      // debug(util.inspect(creators[i], false, null));
        creators.push(data.entries[i].value);
      }
      debug(`fetched Entity from DF successfully.`);
      return creators;
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
    .then(creators => {
      var spliceCreators = creators.splice(0, 1);
      deleteEntitiesFromDF(spliceCreators);
    });
}
function deleteEntitiesFromDF (creators, entityname) {
  return fetch(mustache.render(
    config.endpoints.DF_ENTITY_DELETE_URL,
    {
      entityname,
    }
  ), {method: `DELETE`, body: JSON.stringify(creators), headers: basicHeaderRequest})
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
  fetchNewEntitiesFromIAAndPostToDF,
  deleteAllEntitiesFromDF,
};
