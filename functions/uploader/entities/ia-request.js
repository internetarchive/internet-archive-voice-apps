const _ = require(`lodash`);
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const fetch = require(`node-fetch`);
const mustache = require('mustache');

const config = require('../../src/config');
const {postEntitiesToDF, fetchEntitiesFromDF} = require('./entities');

/**
 * get unique & filtered entities for DialogFlow
 *
 * @param docs {array}
 * @returns entities {array}
 */
function getUniqueCreatorsFromIA (docs) {
  var creators = [];
  var strCreator = ``;
  for (let i = 0; i < docs.length; i++) {
    var creator = docs[i].creator;
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
 * @param id {string}
 * @param limit {int}
 * @returns entities {array}
 */
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
      debug(`fetched Entity from IA successfully.`);
      return Promise.resolve(getUniqueCreatorsFromIA(data.response.docs));
    }).catch(e => {
      error(`Get error in fetching entity from IA, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

/**
 * get unique & filtered entities from InternetArchive & post to DialogFlow
 *
 * @param entityname {string}
 * @param id {string}
 * @param limit {int}
 * @returns {promise}
 */
function fetchNewEntitiesFromIAAndPostToDF (entityname, id, limit) {
  return Promise.all([
    fetchEntitiesFromIA(id, limit),
    fetchEntitiesFromDF(entityname),
  ])
    .then(values => {
      const [creatorsFromIA, creatorsFromDF] = values;
      var dif = _.differenceWith(creatorsFromIA, creatorsFromDF, _.isEqual);
      postEntitiesToDF(entityname, dif, 0);
    });
}

module.exports = {
  getUniqueCreatorsFromIA,
  fetchEntitiesFromIA,
  fetchNewEntitiesFromIAAndPostToDF,
};
