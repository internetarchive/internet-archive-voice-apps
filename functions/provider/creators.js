const debug = require('debug')('ia:provider:creators:debug');
const error = require('debug')('ia:provider:creators:error');
const fetch = require('node-fetch');
const mustache = require('mustache');

const config = require('../config');

const {buildQueryCondition} = require('./advanced-search');

/**
 * Fetch popular creators by query condition
 *
 * @param query
 */
function fetchCreatorsBy (query) {
  debug('fetch creators by:', query);
  const {
    limit = 3,
    page = 0,
    order = 'downloads+desc'
  } = query;

  // create search query
  const condition = buildQueryCondition(query);
  debug(`condition ${condition}`);

  const fields = 'creator,identifier';
  debug(`fetch creators by ${JSON.stringify(query)}`);

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
      items: json.response.docs.map(item => Object.assign({}, item, {
        // year: parseInt(item.year),
      })),
    }))
    .catch(e => {
      error(`Get error on fetching albums of artist by: ${query}, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchCreatorsBy,
};
