const debug = require(`debug`)(`ia:uploader:collection:debug`);

const config = require('../config');
const {fetchNewEntitiesFromIAAndPostToDF} = require('./ia-request');

function uploadCollection () {
  debug(`uploadCollection...`);
  fetchNewEntitiesFromIAAndPostToDF(config.uploader.collection.ENTITY, config.uploader.collection.ID, config.uploader.collection.LIMIT);
}

module.exports = {
  uploadCollection,
};
