const axios = require('axios');
const _ = require('lodash');
const util = require('util');

const config = require('../config');
const delayedPromise = require('../utils/delay');
const {debug, error} = require('../utils/logger')('ia:provider:albums');

const {buildQueryCondition} = require('./advanced-search');
const endpointProcessor = require('./endpoint-processor');

/**
 * Fetch details about Album
 *
 * @param app
 * @param id {string} id of album
 * @param {number} [retry]
 * @param {number} [delay] delay between requests
 * @returns {Promise}
 */
function fetchAlbumDetails (app, id, {retry = 0, delay = 1000} = {}) {
  return axios.get(
    endpointProcessor.preprocess(
      config.endpoints.COLLECTION_URL, app, {id}
    )
  )
    .catch((error) => {
      if (retry > 0) {
        return delayedPromise(delay)
          .then(() => fetchAlbumDetails(id, {retry: retry - 1}));
      } else {
        return Promise.reject(error);
      }
    })
    .then(res => {
      const json = res.data;
      return {
        id,
        collections: _.uniq(json.metadata
          .collection
          .filter(c => !c.startsWith('fav-'))),
        creator: json.metadata.creator,
        year: parseInt(json.metadata.year) || (new Date(json.metadata.date)).getFullYear(),
        coverage: json.metadata.coverage,
        title: json.metadata.title,
        songs: json.files
        // usually songs don't have 'creator' field as well
          .filter(f => f.format === 'VBR MP3' && f.title)
          .map(f => ({
            filename: f.name,
            title: f.title,
          }))
      };
    });
}

/**
 * Fetch some albums of artist/creator by its collection id
 * not all artists have dedicated collection
 * so we use fetchAlbumsByQuery instead
 *
 * @param app
 * @param {string} id - identifier of creator
 * @param {number} limit
 * @param {number} page
 * @param {string} order - by default we fetch the most popular
 */
function fetchAlbumsByCreatorId (app, id, {
  limit = 3,
  page = 0,
  order = 'downloads+desc',
  fields = 'identifier,coverage,title,year',
} = {}) {
  debug(`fetch albums of ${id}`);
  return axios.get(
    endpointProcessor.preprocess(
      config.endpoints.COLLECTION_ITEMS_URL, app,
      {
        id,
        limit,
        page,
        order,
        fields,
      }
    )
  )
    .then(res => {
      const json = res.data;
      debug(`fetch ${json.response.docs.length} albums`);
      return {
        items: json.response.docs.map(a => ({
          identifier: a.identifier,
          coverage: a.coverage,
          subject: a.subject,
          title: a.title,
          year: parseInt(a.year),
        })),
        total: json.response.numFound,
      };
    })
    .catch(e => {
      error(`Get error on fetching albums of artist ${id}, error:`, e);
      return Promise.reject(e);
    });
}

/**
 * Fetch some albums by query
 *
 * @param app
 * @param {Object} query
 * @param {string} query.collectionId
 * @param {string} query.coverage
 * @param {string} query.creator
 * @param {number} query.year
 *
 * @param {number} query.limit
 * @param {number} query.page
 * @param {string} query.order
 *
 * @return {Promise}
 */
function fetchAlbumsByQuery (app, query) {
  query = Object.assign({}, {
    fields: 'identifier,coverage,title,year',
    // we require `coverage` field here to filter items
    // with this field only.
    // Luckily for us only albums/converts/plates have it
    // so it should work until we will find better solution here
    //
    // without this key we could get for example,
    // creator's collection.
    coverage: '*',
    limit: 3,
    page: 0,
    order: 'downloads+desc',
  }, query);

  // create search query
  const condition = buildQueryCondition(query);
  debug(`condition ${condition}`);

  debug('Fetch albums by', query);

  return axios.get(
    endpointProcessor.preprocess(
      config.endpoints.QUERY_COLLECTIONS_URL,
      app,
      Object.assign({}, query, {condition})
    )
  )
    .then(res => ({
      items: res.data.response.docs.map(a => (Object.assign({}, a, {
        year: parseInt(a.year),
      }))),
      total: res.data.response.numFound,
    }))
    .catch(e => {
      error(`Get error on fetching albums of artist by: ${util.inspect(query)}, error:`, e);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchAlbumDetails,
  fetchAlbumsByCreatorId,
  fetchAlbumsByQuery,
};
