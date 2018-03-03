const fetch = require(`node-fetch`);
// const debug = require(`debug`)(`ia:uploader:getCollectionFromIA:debug`);
const error = require(`debug`)(`ia:uploader:getCollectionFromIA:error`);
const util = require(`util`);
const _ = require(`lodash`);
var shouldDelete = false;
const mustache = require('mustache');
const config = require('../config');

const basicHeaderRequest = {
  'content-type': 'application/json; charset=UTF-8',
  'authorization': 'BEARER DIALOG_FLOW_DEV_TOKEN'
};
const entityname = 'creators';

fetchNewCollectionsFromIAAndPostToDF();
if (shouldDelete) {
  deleteAllCollectionDataFromDF();
}
function fetchCollectionsFromIA () {
  var id = `etree`;
  var limit = 200000;
  var page = 0;
  var sort = 'downloads+desc';
  console.log(`fetching collection data from IA...`);
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
  console.log(url);
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
      creators = unique(creators);
      console.log(`fetched Collection from IA successfully.`);
      return creators;
    }).catch(e => {
      error(`Get error in fetching collection from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function fetchNewCollectionsFromIAAndPostToDF () {
  return Promise.all([
    fetchCollectionsFromIA(),
    fetchCollectionDataFromDF(),
  ])
    .then(values => {
      const [creatorsFromIA, creatorsFromDF] = values;
      var dif = _.differenceWith(creatorsFromIA, creatorsFromDF, _.isEqual);
      console.log(util.inspect(dif, false, null));
      console.log(`Done`);
      postCollectionDataToDF(dif, 0, 1000);
    });
}

// Maximum 1,000 records per request
// Maximum 30,000 records per entity
function postCollectionDataToDF (creators, first, last) {
  console.log(`first : ` + first);
  console.log(`Creators Length : ` + creators.length);
  console.log(`posting Collection to DF...`);
  var data = [];
  var maxRequest = 1000;
  if (last > creators.length) {
    last = creators.length;
  }
  if (first === last) {
    console.log(`posted Collection to DF Successfully.`);
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
        console.log(`Error : ` + data.status.errorDetails);
        return;
      }
      console.log(util.inspect(data, false, null));
      console.log(`posted Collection to DF Successfully.`);
      first = last;
      last = first + maxRequest;
      postCollectionDataToDF(creators, first, last);
    })
    .catch(e => {
      error(`Get error in posting collection to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function fetchCollectionDataFromDF () {
  console.log(`fetching collection data from DF...`);
  return fetch(mustache.render(
    config.endpoints.DF_ENTITY_GET_URL,
    {
      entityname,
    }
  ), {method: `GET`, headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      console.log(util.inspect(data, false, null));
      var creators = [];
      for (var i = 0, len = data.entries.length; i < len; i++) {
      // console.log(util.inspect(creators[i], false, null));
        creators.push(data.entries[i].value);
      }
      console.log(`fetched Collection from DF successfully.`);
      return creators;
    })
    .catch(e => {
      error(`Get error in fetching collection from DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}
function deleteAllCollectionDataFromDF () {
  return Promise.all([
    fetchCollectionDataFromDF(),
  ])
    .then(creators => {
      var spliceCreators = creators.splice(0, 1);
      deleteCollectionDataFromDF(spliceCreators);
    });
}
function deleteCollectionDataFromDF (creators) {
  return fetch(mustache.render(
    config.endpoints.DF_ENTITY_DELETE_URL,
    {
      entityname,
    }
  ), {method: `DELETE`, body: JSON.stringify(creators), headers: basicHeaderRequest})
    .then(res => res.json())
    .then(data => {
      console.log(util.inspect(data, false, null));
      console.log(`Deleted Collection to dialogflow Successfully.`);
    })
    .catch(e => {
      error(`Get error in deleting collection in DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function unique (ar) {
  return ar.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}
