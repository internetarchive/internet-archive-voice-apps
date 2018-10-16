const debug = require(`debug`)(`ia:uploader:collection:debug`);

const config = require('../config');
const {fetchNewEntitiesFromIAAndPostToDF} = require('./ia-request');

/**
 * get unique & filtered genres from InternetArchive & post to DialogFlow
 *
 * @returns {promise}
 */
function uploadGenres () {
  debug(`uploadGenres...`);
  fetchNewEntitiesFromIAAndPostToDF(config.uploader.genres.ENTITY_ID, config.uploader.genres.ID, config.uploader.genres.FIELD, config.uploader.genres.LIMIT);
}

module.exports = {
  uploadGenres,
};
