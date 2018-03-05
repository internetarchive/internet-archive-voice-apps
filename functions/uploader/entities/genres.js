const {fetchNewEntitiesFromIAAndPostToDF} = require('./entities');
const ENTITY_NAME = `testing-collection`;
const ID = `georgeblood`;
const LIMIT = 100000;

function uploadGenres () {
  fetchNewEntitiesFromIAAndPostToDF(ENTITY_NAME, ID, LIMIT);
}

module.exports = {
  uploadGenres,
};
