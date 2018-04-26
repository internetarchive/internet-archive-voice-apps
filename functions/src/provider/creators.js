const axios = require('axios');
const util = require('util');

const config = require('../config');
const {debug, error} = require('../utils/logger')('ia:provider:creators');

const {buildQueryCondition} = require('./advanced-search');
const endpointProcessor = require('./endpoint-processor');

/**
 * Fetch popular creators by query condition
 *
 * @param app
 * @param query
 */
function fetchCreatorsBy (app, query) {
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
      endpointProcessor.preprocess(
        config.endpoints.QUERY_COLLECTIONS_URL, app, {
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
