/* Possible Queries to initiate */
// "npm run uploader all" or "npm run uploader" to execute all uploader script
// "npm run uploader entities all" or "npm run uploader entities" to execute all uploader script in entities
// "npm run uploader entities collection" to execute uploader script for collection in entities

const _ = require(`lodash`);
const debug = require(`debug`)(`ia:uploader:index:debug`);
const error = require(`debug`)(`ia:uploader:index:error`);

const {uploadCollection} = require('./entities/collection');
const {uploadGenres} = require('./entities/genres');

const ALL = `all`;

const entities = {
  collection: uploadCollection,
  genres: uploadGenres,
};
const all = {
  entities: entities,
};

handle(process.argv);

function handle (argv) {
  debug(argv);
  if (argv.length < 3 || argv[2] === ALL) {
    execute(ALL, ALL);
  } else if (argv.length < 4 || argv[3] === ALL) {
    execute(argv[2], ALL);
  } else {
    execute(argv[2], argv[3]);
  }
}

function execute (level1, level2) {
  if (level1 === ALL) {
    _.each(all, function (val, key) {
      if (val) {
        _.each(val, function (subVal, subKey) {
          if (subVal) {
            subVal();
          }
        });
      }
    });
  } else if (_.has(all, level1) && level2 === ALL) {
    _.each(all[level1], function (subVal, subKey) {
      if (subVal) {
        subVal();
      }
    });
  } else if (_.has(all, level1) && _.has(all[level1], level2)) {
    all[level1][level2]();
  } else {
    error(`That was not a valid command.`);
    return `That was not a valid command.`;
  }
}

module.exports = {
  handle,
  execute,
};
