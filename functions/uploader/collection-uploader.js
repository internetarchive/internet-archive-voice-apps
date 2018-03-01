const fetch = require(`node-fetch`);
const debug = require(`debug`)(`ia:uploader:getCollectionFromIA:debug`);
const error = require(`debug`)(`ia:uploader:getCollectionFromIA:error`);
const util = require(`util`);
const _ = require(`lodash`);

fetchCollectionsFromIA();
// deleteAllCollectionDataFromDF();

function fetchCollectionsFromIA () {
  debug(`fetching collection data from IA...`);
  return fetch(`https://web.archive.org/advancedsearch.php?q=collection%3A(etree)&fl[]=creator&sort[]=downloads+desc&sort[]=&sort[]=&rows=200000&page=1&output=json`)
    .then(res => res.json())
    .then(data => {
      var creatorsJsonArray = data.response.docs;
      var creators = [];
      var lookup = {};
      for (let i = 0; i < creatorsJsonArray.length; i++) {
        var creator = JSON.stringify(creatorsJsonArray[i].creator);
        if (creator != null) {
          if (!(creator in lookup)) {
            lookup[creator] = 1;
            creators.push(creator);
          }
        }
      }
      debug(`fetched Collection successfully.`);
      return creators;
    }).catch(e => {
      error(`Get error on fetching collection from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function fetchCollectionDataFromDF () {
  
  return fetch(`https://api.dialogflow.com/v1/entities/f505c2f0-8ffc-4196-a87d-1d6cab3e4b80?v=20150910`, { method: `GET`, headers: { 'Content-Type': 'application/json;charset=UTF-8', 'authorization': 'BEARER DIALOG_FLOW_DEV_TOKEN'}})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      debug(`posted Collection to dialogflow Successfully.`);
      var creators = [];
      for (var i = 0, len = data.entries.length; i<len; i++) {
      //debug(util.inspect(creators[i], false, null));
      creators.push(data.entries[i].value);
      }
      return creators;
    })
    .catch(e => {
      error(`Get error on fetching collection from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

function deleteAllCollectionDataFromDF () {
 return Promise.all([
fetchCollectionDataFromDF(),
  ])
    .then(creators => {
var my_creators = creators.splice(0, 1);
deleteCollectionDataFromDF(my_creators);
    });
}

function deleteCollectionDataFromDF (creators) {
  
  return fetch(`https://api.dialogflow.com/v1/entities/f505c2f0-8ffc-4196-a87d-1d6cab3e4b80?v=20150910`, { method: `DELETE`, body: JSON.stringify(creators), headers: { 'Content-Type': 'application/json;charset=UTF-8', 'authorization': 'BEARER DIALOG_FLOW_DEV_TOKEN'}})
    .then(res => res.json())
    .then(data => {
      debug(util.inspect(data, false, null));
      debug(`posted Collection to dialogflow Successfully.`);
    })
    .catch(e => {
      error(`Get error on fetching collection from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}
