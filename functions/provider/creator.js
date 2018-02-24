const debug = require('debug')('ia:search:creator:debug');
const error = require('debug')('ia:search:creator:error');
const fetch = require('node-fetch');
const mustache = require('mustache');

const config = require('../config');

/**
 * Fetch some albums of artist/creator
 *
 * @param {string} id - identifier of creator
 * @param {number} limit
 * @param {number} page
 * @param {string} sort - by default we fetch the most popular
 */
function fetchAlbums (id, {
  limit = 3,
  page = 0,
  sort = 'downloads+desc',
} = {}) {
  debug(`Fetch albums of ${id}`);
  return fetch(
    mustache.render(
      config.endpoints.COLLECTION_ITEMS_URL,
      {
        id,
        limit,
        page,
        sort,
        fields: 'identifier,coverage,title,year',
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
    }))
    .catch(e => {
      error(`Get error on fetching albums of artist ${id}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchAlbums,
};
