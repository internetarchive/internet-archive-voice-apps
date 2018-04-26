const axios = require('axios');
const mustache = require('mustache');

const config = require('../config');
const {debug, error} = require('../utils/logger')('ia:search:collection');

const endpointProcessor = require('./endpoint-processor');

/*
 Could be interesting Fields:

 from: https://archive.org/metadata/78rpm
 metadata.spotlight_identifier:"OldMacdonaldHadAFarmBySamPattersonTrio1926"

 from: https://archive.org/metadata/etree
 subject:"Live Music"
 title_message:"Free Music"
 */
/**
 * Fetch details about collection
 *
 * @param {string} id - identifier of collection
 */
function fetchDetails (id) {
  debug(`fetch collection ${id}`);
  return axios.get(mustache.render(config.endpoints.COLLECTION_URL, {id}))
    .then(res => {
      return {
        title: res.data.metadata.title,
      };
    })
    .catch(e => {
      error(`Get error on fetching collection ${id}, error:`, e);
      return Promise.reject(e);
    });
}

/**
 * Fetch items of collection
 *
 * @param app
 * @param {string} id - identifier of collection
 * @returns {Promise}
 */
function fetchItems (app, id) {
  debug(`fetch collection items ${id}`);
  return axios.get(endpointProcessor.preprocess(
    config.endpoints.QUERY_COLLECTIONS_URL, app, {id}
  ))
    .then(res => res.data.response.docs)
    .catch(e => {
      error(`Get error on fetching collection ${id} items, error:`, e);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchDetails,
  fetchItems,
};
