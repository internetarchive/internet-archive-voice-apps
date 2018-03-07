const debug = require('debug')('ia:provider:albums:debug');
const error = require('debug')('ia:provider:albums:error');
const fetch = require('node-fetch');
const mustache = require('mustache');

const config = require('../config');
const delayedPromise = require('../utils/delay');

const {buildQueryCondition} = require('./advanced-search');

/**
 * Fetch details about Album
 *
 * @param id {string} id of album
 * @param {number} [retry]
 * @param {number} [delay] delay between requests
 * @returns {Promise}
 */
function fetchAlbumDetails (id, {retry = 0, delay = 1000} = {}) {
  return fetch(
    mustache.render(config.endpoints.COLLECTION_URL, {id})
  )
    .catch((error) => {
      if (retry > 0) {
        return delayedPromise(delay)
          .then(() => fetchAlbumDetails(id, {retry: retry - 1}));
      } else {
        return Promise.reject(error);
      }
    })
    .then(res => res.json())
    .then(json => {
      return {
        id,
        creator: json.metadata.creator,
        year: parseInt(json.metadata.year),
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
 * Fetch some albums of artist/creator
 *
 * @param {string} id - identifier of creator
 * @param {number} limit
 * @param {number} page
 * @param {string} order - by default we fetch the most popular
 */
function fetchAlbums (id, {
  limit = 3,
  page = 0,
  order = 'downloads+desc',
} = {}) {
  debug(`fetch albums of ${id}`);
  return fetch(
    mustache.render(
      config.endpoints.COLLECTION_ITEMS_URL,
      {
        id,
        limit,
        page,
        order,
        fields: 'identifier,coverage,title,year',
      }
    )
  )
    .then(res => res.json())
    .then(json => {
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
      error(`Get error on fetching albums of artist ${id}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

/**
 * Fetch some albums of artist/creator
 *
 * @param {Object} query
 * @param {string} query.collectionId
 * @param {string} query.coverage
 * @param {string} query.creatorId
 * @param {number} query.year
 *
 * @param {number} query.limit
 * @param {number} query.page
 * @param {string} query.order
 *
 * @return {Promise}
 */
function fetchAlbumsByQuery (query) {
  const {
    limit = 3,
    page = 0,
    order = 'downloads+desc'
  } = query;

  debug('limit', limit);
  debug(query);
  // create search query
  const condition = buildQueryCondition(query);
  debug(`condition ${condition}`);

  const fields = 'identifier,coverage,title,year';
  debug(`Fetch albums by ${JSON.stringify(query)}`);

  return fetch(
    mustache.render(
      config.endpoints.QUERY_COLLECTIONS_URL,
      {
        condition,
        limit,
        page,
        order,
        fields,
      }
    )
  )
    .then(res => res.json())
    .then(json => ({
      items: json.response.docs.map(a => ({
        identifier: a.identifier,
        coverage: a.coverage,
        subject: a.subject,
        title: a.title,
        year: parseInt(a.year),
      })),
      total: json.response.numFound,
    }))
    .catch(e => {
      error(`Get error on fetching albums of artist by: ${query}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchAlbumDetails,
  fetchAlbums,
  fetchAlbumsByQuery,
};
