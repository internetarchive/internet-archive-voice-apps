const error = require(`debug`)(`ia:prepare_agent:agent:error`);
const fs = require('fs');
const unzip = require(`unzip`);
const zip = require('zipfolder');

const {base64Encode, base64Decode} = require('../utils/base64');

// function to encode file data to base64 encoded string
function prepareAgentToPostToDF (folderPath, zipPath) {
  return zip.zipFolder({folderPath: folderPath, targetFolderPath: zipPath})
    .then(function (path) {
      return Promise.resolve(base64Encode(path));
    }, function (err) {
      return Promise.reject(err);
    });
}

// function to create file from base64 encoded string
function prepareAgentToFetchFromDF (base64str, folderPath, zipPath) {
  return base64Decode(base64str, zipPath)
    .then(isDone => {
      return fs.createReadStream(zipPath).pipe(unzip.Extract({ path: folderPath }));
    })
    .then(close => {
      return new Promise(function (resolve, reject) {
        fs.unlink(zipPath, function (err) {
          if (err) return reject(err);
          else return resolve(zipPath);
        });
      });
    })
    .catch(e => {
      error(`Get error in generating agent.zip, error: ${JSON.stringify(e)}`);
      return Promise.reject(e);
    });
}

module.exports = {
  prepareAgentToPostToDF,
  prepareAgentToFetchFromDF,
};
