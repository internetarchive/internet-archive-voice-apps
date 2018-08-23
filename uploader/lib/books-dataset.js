const axios = require('axios');

const {preprocess} = require('./endpoint-processor');

/**
 * Fetch all books and store to file
 */
async function fetchAllAndSaveToFile (ops) {
  const res = await axios.get(preprocess(ops.endpoint, {...ops, pageIndex: 0}));
  const entities = res.data.response.docs;
  console.log(entities);
}

module.exports = {
  fetchAllAndSaveToFile,
};
