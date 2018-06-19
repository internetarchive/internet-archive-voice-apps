const request = require('request');
const traverse = require('traverse');
const xml2js = require('xml2js');
const dialog = require('../dialog');
const mustache = require('mustache');
const waybackStrings = require('../strings').intents.wayback;
const {debug} = require('../utils/logger')('ia:actions:wayback-machine');

/**
 * Handle wayback query action
 * - fill slots of wayback query
 * - perform data requests to archive and alexa rankings
 * - construct response speech for action
 *
 * @param app
 */
function handler (app) {
  // Check parameter for Wayback qualifier
  let wayback = app.params.getByName('wayback');
  if (wayback.includes('wayback') === false) {
    debug('wayback action called by mistake');
  }

  // Get url parameter
  var url = app.params.getByName('url');

  // Create wayback object
  var waybackObject = {
    url: '',
    earliestYear: 0,
    latestYear: 0,
    totalUniqueURLs: 0,
    alexaWorldRank: 0,
    alexaUSRank: 0,
    speech: 'default speech'
  };

  waybackObject.url = url;
  var archiveQueryURL = 'http://web.archive.org/__wb/search/metadata?q=' + url;
  var alexaQueryURL = 'http://data.alexa.com/data?cli=10&url=' + url;

  return Promise.all([getRequest(archiveQueryURL), getRequest(alexaQueryURL)])
    .then(function (allData) {
      // All data available here in the order it was called.

      // Parse data from archive request
      var archiveJSON = JSON.parse(allData[0]);
      archiveEngine(archiveJSON, waybackObject);

      // Parse data from alexa request
      var alexaJSON;
      var XMLparser = new xml2js.Parser();
      XMLparser.parseString(allData[1], function (err, result) {
        if (err) {
          debug('Uh-oh, the XML parser didn\'t work');
        } else {
          alexaJSON = JSON.parse(JSON.stringify(result));
        }
      });
      alexaEngine(alexaJSON, waybackObject);

      /*
        debug('ARCHIVE');
        debug('Date of first archive: ' + waybackObject.earliestYear);
        debug('Date of last archive: ' + waybackObject.latestYear);
        debug('Total Unique URLs: ' + waybackObject.totalUniqueURLs);
        debug('ALEXA');
        debug('Alexa World Rank: ' + waybackObject.alexaWorldRank);
        debug('Alexa US Rank: ' + waybackObject.alexaUSRank);
        */

      // Construct response dialog for action
      if (waybackObject.alexaUSRank !== 0) {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += ' and <say-as interpret-as="ordinal">' + waybackObject.alexaUSRank + '</say-as> in the United States';
      } else {
        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        waybackObject.speech += '.';
      }
      // debug('speech:' + waybackObject.speech);

      dialog.close(app, waybackObject);
    });
} // End of handler

function getRequest (url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

function archiveEngine (archiveJSON, waybackObject) {
  // Create array of capture years and then find earliest year
  //  and most recent year.
  var yearsArray = Object.keys(archiveJSON.captures);
  waybackObject.earliestYear = yearsArray[0];
  waybackObject.latestYear = yearsArray[yearsArray.length - 1];

  // Traverse URL category to find baseline of URL count
  traverse(archiveJSON.urls[waybackObject.earliestYear]).forEach(function (node) {
    if (typeof node === 'number') {
      waybackObject.totalUniqueURLs += node;
    }
  });
  // debug('Beginning value for total unique urls: ' + totalUniqueURLs);

  traverse(archiveJSON.new_urls).forEach(function (node) {
    if (typeof node === 'number') {
      waybackObject.totalUniqueURLs += node;
    }
  });
}

function alexaEngine (alexaJSON, waybackObject) {
  waybackObject.alexaWorldRank = alexaJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
  var countryID = alexaJSON['ALEXA']['SD'];
  debug('country id: ' + countryID);
  if (countryID.includes('COUNTRY')) {
    debug('country exists');
    waybackObject.alexaUSRank = alexaJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];
  } else {
    debug('country doesn\'t exist');
  }
}

module.exports = {
  handler
};
