const debug = require('debug')('ia:provider:creators:debug');
// const error = require('debug')('ia:provider:creators:error');
// const fetch = require('node-fetch');
// const mustache = require('mustache');

function fetchCreators (query) {
  debug('fetch creators by:', query);
  // const {
  //   limit = 3,
  //   page = 0,
  //   sort = 'downloads+desc'
  // } = query;

  return Promise.resolve();
}

module.exports = {
  fetchCreators,
};
