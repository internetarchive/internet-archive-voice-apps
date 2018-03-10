const debug = require(`debug`)(`ia:uploader:collection:debug`);

const config = require('../config');
const {fetchNewEntitiesFromIAAndPostToDF} = require('./ia-request');

function uploadCollection () {
  debug(`uploadCollection...`);
  fetchNewEntitiesFromIAAndPostToDF(config.constants.collection.ENTITY, config.constants.collection.ID, config.constants.collection.LIMIT);
}

module.exports = {
  uploadCollection,
};
