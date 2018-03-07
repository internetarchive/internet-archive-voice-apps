const fetch = require(`node-fetch`);
const debug = require(`debug`)(`ia:uploader:entities:debug`);
const error = require(`debug`)(`ia:uploader:entities:error`);
const util = require(`util`);
const _ = require(`lodash`);
const mustache = require('mustache');
const config = require('../config');
const {postEntitiesToDF, fetchEntitiesFromDF} = require('./entities');

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
      return getUniqueCreatorsFromIA(data.response.docs);
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

module.exports = {
  getUniqueCreatorsFromIA,
  fetchEntitiesFromIA,
  fetchNewEntitiesFromIAAndPostToDF,
};
