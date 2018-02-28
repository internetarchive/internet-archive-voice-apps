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
  debug(`fetch albums of ${id}`);
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
      };
    })
    .catch(e => {
      error(`Get error on fetching albums of artist ${id}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

const nameToParameter = {
  coverage: 'coverage',
  creatorId: 'collection',
  collectionId: 'collection',
  year: 'year',
  // TODO: add other parameters
};

/**
 * Is parameter valid
 *
 * @param value
 */
const isValidParameter = (value) => (value !== undefined) && (value !== null);

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
 * @param {string} query.sort
 *
 * @return {Promise}
 */
function fetchAlbumsByQuery (query) {
  const {
    limit = 3,
    page = 0,
    sort = 'downloads+desc'
  } = query;

  // create search query
  const condition = Object.keys(query)
    .map(name => ({name, paramName: nameToParameter[name]}))
    .filter(
      ({name, paramName}) => paramName && isValidParameter(query[name])
    )
    .reduce(
      (acc, {name, paramName}) => {
        acc.push(`${paramName}:(${query[name]})`);
        return acc;
      },
      []
    )
    .join(' AND ');

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
        sort,
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
    }))
    .catch(e => {
      error(`Get error on fetching albums of artist by: ${query}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchAlbums,
  fetchAlbumsByQuery,
};
