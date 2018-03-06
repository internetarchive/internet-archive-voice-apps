const {fetchNewEntitiesFromIAAndPostToDF} = require('./entities');
const ENTITY_NAME = `testing-genres`;
const debug = require(`debug`)(`ia:uploader:collection:debug`);
const ID = `georgeblood`;
const LIMIT = 100000;

function uploadGenres () {
  debug(`uploading...`);
  fetchNewEntitiesFromIAAndPostToDF(ENTITY_NAME, ID, LIMIT);
}

module.exports = {
  uploadGenres,
};
