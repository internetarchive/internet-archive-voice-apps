// Third party imports
const _ = require('lodash');
const axios = require('axios');
const mustache = require('mustache');
const xml2js = require('xml2js');

// Local imports
const config = require('../config');
const {debug} = require('../utils/logger')('ia:actions:wayback-machine');
const dialog = require('../dialog');
const endpointProcessor = require('../network/endpoint-processor');
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

  // Check parameter for Wayback qualifier
  // let wayback = app.params.getByName('wayback');
  // if (!wayback.includes('wayback')) {
  if (!app.params.getByName('wayback') && !app.params.getByName('url')) {
    debug('wayback action called by mistake');
    dialog.ask(app, waybackObject);
  }
  debug('Wayback exists: ' + !app.params.getByName('wayback'));
  debug('URL exists: ' + app.params.getByName('url') !== undefined);
  /*
  if (!app.params.getByName('wayback') && app.params.getByName('url')) {
    debug('wayback action called by mistake');
    dialog.ask(app, waybackObject);
  }
  */
  // Get url parameter and make url queries
  waybackObject.url = app.params.getByName('url');
  const archiveQueryURL = endpointProcessor.preprocess(
    config.wayback.ARCHIVE, app, waybackObject
  );
  const alexaQueryURL = endpointProcessor.preprocess(
    config.wayback.ALEXA, app, waybackObject
  );

  return Promise.all([axios.get(archiveQueryURL), axios.get(alexaQueryURL)])
    .then(function (allData) {
      // All data available here in the order it was called.

      // Parse data from archive request
      let archiveJSON = allData[0].data;
      archiveEngine(archiveJSON, waybackObject);

      // Parse data from alexa request
      let alexaJSON;
      let XMLparser = new xml2js.Parser();
      XMLparser.parseString(allData[1].data, function (err, result) {
        if (err) {
          debug('The XML parser didn\'t work');
          waybackObject.speech = waybackStrings.error;
          dialog.ask(app, waybackObject);
        } else {
          alexaJSON = JSON.parse(JSON.stringify(result));
        }
      });
      alexaEngine(alexaJSON, waybackObject);

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
  // Create array of capture years and then find earliest year
  //  and most recent year.
  let yearsArray = Object.keys(archiveJSON.captures);
  waybackObject.earliestYear = yearsArray[0];
  waybackObject.latestYear = yearsArray[yearsArray.length - 1];

  // Traverse URL category
  const traverse = obj => {
    _.forOwn(obj, (val, key) => {
      if (_.isArray(val)) {
        val.forEach(el => {
          traverse(el);
        });
      } else if (_.isObject(val)) {
        traverse(val);
      } else {
        waybackObject.totalUniqueURLs += val;
      }
    });
  };

  // Find baseline of URL count
  traverse(archiveJSON.urls[waybackObject.earliestYear]);
  // Find final count of unique urls
  traverse(archiveJSON.new_urls);
}

function alexaEngine (alexaJSON, waybackObject) {
  waybackObject.alexaWorldRank = alexaJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
  try {
    waybackObject.alexaUSRank = alexaJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];
  } catch (e) {
    debug('Country not found');
    debug(e);
  }
}

module.exports = {
  handler,
};
