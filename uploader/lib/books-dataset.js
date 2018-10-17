// put it on the top to be able to promisify on-fly all requested libs
const util = require('util');

const axios = require('axios');
const axiosRetry = require('axios-retry');
const stringifyToCSV = util.promisify(require('csv').stringify);
const fs = require('fs');
const mkdirp = util.promisify(require('mkdirp'));
const path = require('path');

const {preprocess} = require('./endpoint-processor');
const processEntities = require('./process-entities');

const fsWriteFile = util.promisify(fs.writeFile);

axiosRetry(axios, {retries: 5});

/**
 * Fetch all books and store to file
 */
async function fetchAllAndSaveToFile (ops) {
  console.log('Fetching all books');

  const onPageReceived = (pageIndex, numOfPages) => {
    process.stdout.write(`\r ${Math.round(100 * pageIndex / (numOfPages - 1))}%`);
  }

  let books;
  try {
    books = await feetchAllBooks(ops, {onPageReceived});
  } catch (err) {
    console.log('\nFailed request');
    console.log('url:', err.config.url);
    console.log('status:', err.response.status);
    console.log('data:', err.response.data);
    // TODO:
    // after 201 pages we fail with error status 507
    // and message:
    //
    // request
    // https://archive.org/advancedsearch.php?q=collection:librivoxaudio&fl[]=creator,year,title,subject,identifier&rows=50&page=201&output=json
    return;
  }

  console.log('\nBooks are loaded');

  if (ops.fields) {
    console.log(`Extract field(s) "${ops.fields}"`);
    books = books.map(book => ops.fields.reduce((acc, field) => acc.concat(book[field]), []));
  }

  books = processEntities.clean(books);
  books = processEntities.sortEntities(books);

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
    const url = preprocess(ops.endpoint, {...ops, pageIndex});
    const res = await axios.get(url);

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
