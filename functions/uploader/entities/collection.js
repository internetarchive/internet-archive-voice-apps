const {fetchNewEntitiesFromIAAndPostToDF} = require('./entities');
const ENTITY_NAME = `creators`;
const ID = `etree`;
const LIMIT = 200000;

function uploadCollection () {
  fetchNewEntitiesFromIAAndPostToDF(ENTITY_NAME, ID, LIMIT);
}

module.exports = {
  uploadCollection,
};
