const axios = require('axios');
const fs = require('fs');
const util = require('util');

const {preprocess} = require('./endpoint-processor');

const fsWriteFile = util.promisify(fs.writeFile);

/**
 * Fetch all books and store to file
 */
async function fetchAllAndSaveToFile (ops) {
  console.log('Fetching all books');

  const onPageReceived = (pageIndex, numOfPages) => {
    process.stdout.write(`\r ${Math.round(100 * pageIndex / numOfPages)}%`);
  }

  const books = await feetchAllBooks(ops, {onPageReceived});

  console.log('\nBooks are loaded');

  await outputs[ops.output.format](ops, books);
}

const outputs = {
  json: storeToJSON,
  csv: storeToCSV,
};

async function storeToJSON (ops, entities) {
  if (!ops.output.encoding) {
    throw new Error('It seems we have missed ops.output.encoding');
  }
  if (!ops.output.filename) {
    throw new Error('It seems we have missed ops.output.filename');
  }
  console.log(`storing JSON file ${ops.output.filename}`);
  await fsWriteFile(ops.output.filename, JSON.stringify(entities), ops.output.encoding);
  console.log(`JSON file ${ops.output.filename} is stored`);
}

async function storeToCSV (ops, entities) {
  console.log('storing to CSV file');
  // TODO: encode to csv
  await fsWriteFile(ops.output.filename, entities);
  console.log('CSV file is stored');
}

async function feetchAllBooks (ops, handlers) {
  let pageIndex = 0;
  let numOfPages = 3;
  let entities = [];
  while (numOfPages === undefined || pageIndex < numOfPages) {
    const res = await axios.get(preprocess(ops.endpoint, {...ops, pageIndex}));
    if (numOfPages === undefined) {
      numOfPages = res.data.response.numFound /
        Math.min(res.data.response.docs.length, ops.pageSize);
    }

    entities = entities.concat(res.data.response.docs);
    handlers.onPageReceived(pageIndex, numOfPages);
    pageIndex++;
  }

  return entities;
}

module.exports = {
  fetchAllAndSaveToFile,
};
