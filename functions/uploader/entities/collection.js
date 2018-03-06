const {fetchNewEntitiesFromIAAndPostToDF} = require('./entities');
const ENTITY_NAME = `testing-collection`;
const debug = require(`debug`)(`ia:uploader:collection:debug`);
const ID = `etree`;
const LIMIT = 200000;

function uploadCollection () {
  debug(`uploading...`);
  fetchNewEntitiesFromIAAndPostToDF(ENTITY_NAME, ID, LIMIT);
}

module.exports = {
  uploadCollection,
};
