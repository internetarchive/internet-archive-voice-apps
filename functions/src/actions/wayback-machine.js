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
 * - perform data REQUEST
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

  var url = app.params.getByName('url');

  // Create wayback object with properties to be filled in request
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

  // REQUEST to get data from Archive and Alexa Rankings
  getRequest(archiveQueryURL).then(function (body1) {
    debug('ARCHIVE');
    // Parse data from request
    var importedJSON = JSON.parse(body1);

    // Create array of capture years and then find earliest year
    //  and most recent year.
    var yearsArray = Object.keys(importedJSON.captures);
    waybackObject.earliestYear = yearsArray[0];
    waybackObject.latestYear = yearsArray[yearsArray.length - 1];

    // Traverse URL category to find baseline of URL count
    traverse(importedJSON.urls[waybackObject.earliestYear]).forEach(function (node) {
      if (typeof node === 'number') {
        waybackObject.totalUniqueURLs += node;
      }
    });
    // debug('Beginning value for total unique urls: ' + totalUniqueURLs);

    traverse(importedJSON.new_urls).forEach(function (node) {
      if (typeof node === 'number') {
        waybackObject.totalUniqueURLs += node;
      }
    });

    // debug('Date of first archive: ' + earliestYear);
    // debug('Date of last archive: ' + latestYear);
    // debug('Total Unique URLs: ' + totalUniqueURLs);
    return getRequest(alexaQueryURL);
  }).then(function (body2) {
    debug('ALEXA RANKINGS');
    var parser = new xml2js.Parser();
    parser.parseString(body2, function (err, result) {
      if (err) {
        debug('Uh-oh, the XML parser didn\'t work');
      } else {
        var convertedJSON = JSON.parse(JSON.stringify(result));
        waybackObject.alexaWorldRank = convertedJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
        waybackObject.alexaUSRank = convertedJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];

        waybackObject.speech = mustache.render(waybackStrings.speech, waybackObject);
        //debug('speech:' + waybackObject.speech);
        dialog.close(app, waybackObject);
      }
    });
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

module.exports = {
  handler
};
