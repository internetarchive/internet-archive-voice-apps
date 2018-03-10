const debug = require(`debug`)(`ia:uploader:collection:debug`);

const config = require('../config');
const {fetchNewEntitiesFromIAAndPostToDF} = require('./ia-request');

function uploadGenres () {
  debug(`uploadGenres...`);
  fetchNewEntitiesFromIAAndPostToDF(config.constants.genres.ENTITY, config.constants.genres.ID, config.constants.genres.LIMIT);
}

module.exports = {
  uploadGenres,
};
