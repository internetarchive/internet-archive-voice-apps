const error = require(`debug`)(`ia:uploader:agent:utils:prepare_agent:error`);
const debug = require(`debug`)(`ia:uploader:agent:utils:prepare_agent:debug`);
const fs = require('fs');
const unzip = require(`unzip`);
const zip = require('zipfolder');

const {base64Encode, base64Decode} = require('./base64');

// function to encode file data to base64 encoded string
function prepareAgentToPostToDF (folderPath, zipPath) {
  return zip.zipFolder({folderPath: folderPath, targetFolderPath: zipPath})
    .then(function (path) {
      var encodedBase64 = base64Encode(path);
      debug(encodedBase64);
      return Promise.resolve(encodedBase64);
    });
}

// function to create file from base64 encoded string
function prepareAgentToFetchFromDF (base64str, folderPath, zipPath) {
  return base64Decode(base64str, zipPath)
    .then(isDone => {
      return fs.createReadStream(zipPath).pipe(unzip.Extract({ path: folderPath }));
    })
    .then(close => {
      debug(close);
      return new Promise(function (resolve, reject) {
        fs.unlink(zipPath, function (err) {
          if (err) return reject(err);
          else return resolve(zipPath);
        });
      });
    })
    .catch(e => {
      error(`Get error in generating agent.zip, error: ${e}`);
      return Promise.reject(e);
    });
}

module.exports = {
  prepareAgentToPostToDF,
  prepareAgentToFetchFromDF,
};
