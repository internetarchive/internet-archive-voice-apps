const debug = require(`debug`)(`ia:uploader:collection:debug`);

const config = require('../config');
const {fetchNewEntitiesFromIAAndPostToDF} = require('./ia-request');

/**
 * get unique & filtered collection from InternetArchive & post to DialogFlow
 *
 * @returns {promise}
 */
function uploadCollection () {
  debug(`uploadCollection...`);
  return fetchNewEntitiesFromIAAndPostToDF(config.uploader.collection.ENTITY, config.uploader.collection.ID, config.uploader.collection.LIMIT);
}

module.exports = {
  uploadCollection,
};
