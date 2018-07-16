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
  let waybackObject = {
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
    .then(([archiveRes, alexaRes]) => {
      return ([archiveEngine(archiveRes.data), xmlConverter(alexaRes.data)]);
    })
    .then(([archiveEngineRes, xmlRes]) => {
      waybackObject = Object.assign(waybackObject, archiveEngineRes);
      return alexaEngine(xmlRes);
    })
    .then(response => {
      waybackObject = Object.assign(waybackObject, response);

      // Construct response dialog for action
      if (waybackObject.alexaUSRank !== 0) {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += mustache.render(waybackStrings.additionalSpeech, waybackObject);
      } else {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += '.';
      }
      dialog.close(app, waybackObject);
    })
    .catch(err => {
      debug('Wayback handler has an error: ', err);
      waybackObject.speech = waybackObject.error;
      dialog.ask(app, waybackObject);
    });
} // End of handler

function archiveEngine (archiveJSON) {
  debug('Inside archiveEngine...');
  const res = { earliestYear: 0, latestYear: 0, totalUniqueURLs: 0 };
  // Create array of capture years and then find earliest year
  //  and most recent year.
  let yearsArray = Object.keys(archiveJSON.captures);
  res.earliestYear = yearsArray[0];
  res.latestYear = yearsArray[yearsArray.length - 1];

  // Traverse URL category

  // Find baseline of URL count
  res.totalUniqueURLs += traverse(archiveJSON.urls[res.earliestYear]);
  // debug('Baseline url count: ' + obj.totalUniqueURLs);

  res.totalUniqueURLs += traverse(archiveJSON.new_urls);
  // debug('Final url count: ' + obj.totalUniqueURLs);

  if (res.totalUniqueURLs > 0) {
    debug('archiveEngine successful!');
    return res;
  } else {
    let error = new Error('archiveEngine didn\'t work.');
    return error;
  }
}

function alexaEngine (alexaJSON) {
  debug('Inside alexaEngine...');
  const res = { alexaWorldRank: 0, alexaUSRank: 0 };
  res.alexaWorldRank = alexaJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
  try {
    res.alexaUSRank = alexaJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];
  } catch (e) {
    debug('Country not found');
    debug(e);
  }
  if (res.alexaWorldRank > 0) {
    debug('alexaEngine successful!');
    return res;
  } else {
    let error = new Error('alexaEngine didn\'t work.');
    return error;
  }
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
