// put it on the top to be able to promisify on-fly all requested libs
const util = require('util');

const axios = require('axios');
const stringifyToCSV = util.promisify(require('csv').stringify);
const fs = require('fs');
const mkdirp = util.promisify(require('mkdirp'));
const path = require('path');

const {preprocess} = require('./endpoint-processor');

const fsWriteFile = util.promisify(fs.writeFile);

/**
 * Fetch all books and store to file
 */
async function fetchAllAndSaveToFile (ops) {
  console.log('Fetching all books');

  const onPageReceived = (pageIndex, numOfPages) => {
    process.stdout.write(`\r ${Math.round(100 * pageIndex / (numOfPages - 1))}%`);
  }

  let books = await feetchAllBooks(ops, {onPageReceived});

  console.log('\nBooks are loaded');

  if (ops.fields) {
    console.log(`Extract field(s) "${ops.fields}"`);
    books = books.map(book => ops.fields.reduce((acc, field) => acc.concat(book[field]), []));
  }

  await outputs[ops.output.format](ops.output, books);
}

const outputs = {
  json: storeToJSON,
  csv: storeToCSV,
};

async function storeToJSON (ops, entities) {
  if (!ops.encoding) {
    throw new Error('It seems we have missed ops.encoding');
  }
  if (!ops.filename) {
    throw new Error('It seems we have missed ops.filename');
  }
  console.log(`storing JSON file ${ops.filename}`);
  await mkdirp(path.dirname(ops.filename));
  await fsWriteFile(ops.filename, JSON.stringify(entities), ops.encoding);
  console.log(`JSON file ${ops.filename} is stored`);
}

async function storeToCSV (ops, entities) {
  if (!ops.encoding) {
    throw new Error('It seems we have missed ops.encoding');
  }
  if (!ops.filename) {
    throw new Error('It seems we have missed ops.filename');
  }
  console.log(`storing to CSV file ${ops.filename}`);
  encodedEntities = await stringifyToCSV(entities, ops);
  await fsWriteFile(ops.filename, encodedEntities, ops.encoding);
  console.log(`CSV file ${ops.filename} is stored`);
}

async function feetchAllBooks (ops, handlers) {
  let pageIndex = 0;
  let numOfPages = ops.numOfPages;
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
