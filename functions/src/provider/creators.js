const axios = require('axios');
const mustache = require('mustache');
const util = require('util');

const config = require('../config');
const {debug, error} = require('../utils/logger')('ia:provider:creators');

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
  return axios
    .get(
      mustache.render(
        config.endpoints.QUERY_COLLECTIONS_URL, {
          condition,
          limit,
          page,
          order,
          fields,
        }
      )
    )
    .then(res => {
      if (typeof res.data !== 'object' || !('response' in res.data)) {
        return {
          items: [],
        };
      }
      return {
        items: res.data.response.docs.map(item => Object.assign({}, item, {
          // year: parseInt(item.year),
        })),
      };
    })
    .catch(e => {
      error(`Get error on fetching albums of artist by: ${util.inspect(query)}, error:`, e);
      return Promise.reject(e);
    });
}

module.exports = {
  fetchCreatorsBy,
};
