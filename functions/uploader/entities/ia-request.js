const _ = require(`lodash`);
const axios = require(`axios`);
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const mustache = require('mustache');

const config = require('../../src/config');
const entities = require('./entities');
const util = require(`util`);

fetchEntitiesFromIA('etree', 'creator', 10);
/**
 * get unique & filtered entities for DialogFlow
 *
 * @param docs {array}
 * @param field {string} field need to be extracted creator/subjects
 * @returns entities {array}
 */
function getUniqueCreatorsFromIA (docs, field) {
  var creators = [];
  var strCreator = ``;
  for (let i = 0; i < docs.length; i++) {
    var creator = docs[i][field];
    if (_.isArray(creator)) {
      for (let i = 0; i < creator.length; i++) {
        strCreator = creator[i];
        if (strCreator) {
          strCreator = strCreator.replace(/[()]+/g, ``);
          creators.push(strCreator);
        }
      }
    } else {
      strCreator = creator;
      if (strCreator) {
        strCreator = strCreator.replace(/[()]+/g, ``);
        creators.push(strCreator);
      }
    }
  }
  return _.uniq(creators);
}

/**
 * get entities from InternetArchive
 *
 * @param id {string} etree/georgeblood
 * @param field {string} field need to be extracted creator/subjects
 * @param limit {int} number of records need to be fetch from IA
 * @returns entities {array}
 */
function fetchEntitiesFromIA (id, field, limit) {
  var page = 0;
  var sort = 'downloads+desc';
  debug(`fetching entity data from IA...`);
  var url = mustache.render(
    config.endpoints.COLLECTION_ITEMS_URL,
    {
      platformSubDomain: config.platforms.assistant.endpoint.platformSubDomain,
      id,
      limit,
      page,
      sort,
      fields: field,
    }
  );
  console.log(url);
  return axios(url)
    .then(res => res.data)
    .then(data => {
      debug(util.inspect(data, false, null));
      debug(`fetched Entity from IA successfully.`);
      return Promise.resolve(getUniqueCreatorsFromIA(data.response.docs, field));
    }).catch(e => {
      error(`Get error in fetching entity from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

/**
 * get unique & filtered entities from InternetArchive & post to DialogFlow
 *
 * @param entityid {string} id of entity in dialogflow
 * @param id {string} etree/georgeblood
 * @param field {string} field need to be extracted creator/subjects
 * @param limit {int} number of records need to be fetch from IA
 * @returns {promise}
 */
function fetchNewEntitiesFromIAAndPostToDF (entityid, id, field, limit) {
  return fetchEntitiesFromIA(id, field, limit)
    .then(creatorsFromIA => {
      return entities.postEntitiesToDF(entityid, creatorsFromIA, 0);
    })
    .then(data => {
      return Promise.resolve(data);
    }).catch(e => {
      error(`Get error in fetching new entity from IA and posting to DF, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  getUniqueCreatorsFromIA,
  fetchEntitiesFromIA,
  fetchNewEntitiesFromIAAndPostToDF,
  entities
};
