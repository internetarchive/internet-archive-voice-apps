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
      return Promise.all([archiveEngine(requestData[0].data, waybackObject), xmlConverter(requestData[1].data)]);
    })
    .then(response => {
      return Promise.all([alexaEngine(response[1], waybackObject)]);
    })
    .then(a => {
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

function archiveEngine (archiveJSON, waybackObject) {
  return new Promise(function (resolve, reject) {
    debug('Inside archiveEngine promise...');
    // Create array of capture years and then find earliest year
    //  and most recent year.
    let yearsArray = Object.keys(archiveJSON.captures);
    waybackObject.earliestYear = yearsArray[0];
    waybackObject.latestYear = yearsArray[yearsArray.length - 1];

    // Traverse URL category

    // Find baseline of URL count
    waybackObject.totalUniqueURLs += traverse(archiveJSON.urls[waybackObject.earliestYear]);
    // debug('Baseline url count: ' + waybackObject.totalUniqueURLs);

    waybackObject.totalUniqueURLs += traverse(archiveJSON.new_urls);
    // debug('Final url count: ' + waybackObject.totalUniqueURLs);

    if (waybackObject.totalUniqueURLs > 0) {
      debug('archiveEngine promise successful!');
      resolve();
    }
  });
}

function alexaEngine (alexaJSON, waybackObject) {
  return new Promise(function (resolve, reject) {
    debug('Inside alexaEngine promise...');
    waybackObject.alexaWorldRank = alexaJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
    try {
      waybackObject.alexaUSRank = alexaJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];
    } catch (e) {
      debug('Country not found');
      debug(e);
    }
    if (waybackObject.alexaWorldRank > 0) {
      debug('alexaEngine promise successful!');
      resolve();
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
