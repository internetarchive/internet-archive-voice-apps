// Third party imports
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');

// Local imports
const config = require('../config');
const {debug} = require('../utils/logger')('ia:actions:wayback-machine');
const dialog = require('../dialog');
const endpointProcessor = require('../network/endpoint-processor');
const traverse = require('../utils/traverse');
const waybackStrings = require('../strings').intents.wayback;

/**
 * Handle wayback query action
 * - fill slots of wayback query
 * - perform data requests to archive and alexa rankings
 * - construct response speech for action
 *
 * @param app
 */
function handler (app) {
  // Create wayback object
  const waybackObject = {
    url: '',
    earliestYear: 0,
    latestYear: 0,
    totalUniqueURLs: 0,
    alexaWorldRank: 0,
    alexaUSRank: 0,
    speech: waybackStrings.default,
  };

  // Check to see that both parameters have content
  if (!app.params.getByName('wayback') && !app.params.getByName('url')) {
    debug('wayback action called by mistake');
    dialog.ask(app, waybackObject);
  }

  // Get url parameter and make url queries
  waybackObject.url = app.params.getByName('url');
  const archiveQueryURL = endpointProcessor.preprocess(
    config.wayback.ARCHIVE, app, waybackObject
  );
  const alexaQueryURL = endpointProcessor.preprocess(
    config.wayback.ALEXA, app, waybackObject
  );

  return Promise.all([axios.get(archiveQueryURL), axios.get(alexaQueryURL)])
    .then(function (requestData) {
      return Promise.all([archiveEngine(requestData[0].data), xmlConverter(requestData[1].data)]);
    })
    .then(response => {
      let res = {};
      // Merge response into object for assignment to WB obj
      res = Object.assign({}, res, response[0]);

      waybackObject.earliestYear = res.earliestYear;
      waybackObject.latestYear = res.latestYear;
      waybackObject.totalUniqueURLs = res.totalUniqueURLs;

      return alexaEngine(response[1]);
    })
    .then(response => {
      let res = {};
      // Merge response into object for assignment to WB obj
      res = Object.assign({}, res, response);
      waybackObject.alexaUSRank = res.alexaUSRank;
      waybackObject.alexaWorldRank = res.alexaWorldRank;

      // Construct response dialog for action
      if (waybackObject.alexaUSRank !== 0) {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += mustache.render(waybackStrings.additionalSpeech, waybackObject);
      } else {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += '.';
      }
      dialog.close(app, waybackObject);
    });
} // End of handler

function archiveEngine (archiveJSON) {
  return new Promise(function (resolve, reject) {
    debug('Inside archiveEngine promise...');
    let obj = { earliestYear: 0, latestYear: 0, totalUniqueURLs: 0 };
    // Create array of capture years and then find earliest year
    //  and most recent year.
    let yearsArray = Object.keys(archiveJSON.captures);
    obj.earliestYear = yearsArray[0];
    obj.latestYear = yearsArray[yearsArray.length - 1];

    // Traverse URL category

    // Find baseline of URL count
    obj.totalUniqueURLs += traverse(archiveJSON.urls[obj.earliestYear]);
    // debug('Baseline url count: ' + obj.totalUniqueURLs);

    obj.totalUniqueURLs += traverse(archiveJSON.new_urls);
    // debug('Final url count: ' + obj.totalUniqueURLs);

    if (obj.totalUniqueURLs > 0) {
      debug('archiveEngine promise successful!');
      resolve(obj);
    } else {
      let error = new Error('archiveEngine didn\'t work.');
      reject(error);
    }
  });
}

function alexaEngine (alexaJSON) {
  return new Promise(function (resolve, reject) {
    debug('Inside alexaEngine promise...');
    let obj = { alexaWorldRank: 0, alexaUSRank: 0 };
    obj.alexaWorldRank = alexaJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
    try {
      obj.alexaUSRank = alexaJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];
    } catch (e) {
      debug('Country not found');
      debug(e);
    }
    if (obj.alexaWorldRank > 0) {
      debug('alexaEngine promise successful!');
      resolve(obj);
    } else {
      let error = new Error('alexaEngine didn\'t work.');
      reject(error);
    }
  });
}

function xmlConverter (data) {
  return new Promise(function (resolve, reject) {
    debug('Inside xmlConverter promise...');
    let XMLparser = new xml2js.Parser();
    XMLparser.parseString(data, function (err, result) {
      if (err) {
        let error = new Error('The XML parser didn\'t work.');
        reject(error);
      } else {
        debug('xmlConverter promise successful!');
        resolve(JSON.parse(JSON.stringify(result)));
      }
    });
  });
}

module.exports = {
  handler,
};
