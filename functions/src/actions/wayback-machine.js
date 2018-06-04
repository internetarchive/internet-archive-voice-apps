const request = require('request');
const traverse = require('traverse');
const xml2js = require('xml2js');
const selectors = require('../configurator/selectors');
const query = require('../state/query');
const availableSchemes = require('../strings').intents.waybackMachine;
const {debug, warning} = require('../utils/logger')('ia:actions:music-query');

/**
 * Handle wayback query action
 * - fill slots of wayback query
 *
 * @param app
 */
function handler (app) {
  debug('Start wayback query handler');

  const slots = query.getSlots(app);
  debug('We have slots:', Object.keys(slots));
  if (slots) {
    waybackEngine(slots);
  }
}

/**
 * Wayback Engine
 * - makes requests to Archive and Alexa Rankings for given URL
 *
 * @param url
 * @returns earliestYear, latestYear, totalUniqueURLs, alexaWorldRank, alexaUSRank;
 */
function waybackEngine (slots) {
  if (!slots.includes('wayback')) {
    return debug('wayback action called by mistake');
  }
  var slotURL = slots[1];
  debug('slotURL: ' + slotURL);
  // var slotURL = 'cnn.com';
  var archiveFirstPartURL = 'http://web.archive.org/__wb/search/metadata?q=';
  var queryURL = archiveFirstPartURL + slotURL;

  var alexaFirstPartURL = 'http://data.alexa.com/data?cli=10&url=';
  var alexaQueryURL = alexaFirstPartURL + slotURL;

  // Variables to be returned
  var earliestYear;
  var latestYear;
  var totalUniqueURLs = 0;
  var alexaWorldRank;
  var alexaUSRank;

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

  // REQUEST to get data from Archive and Alexa Rankings
  getRequest(queryURL).then(function (body1) {
    debug('ARCHIVE');
    // Parse data from request
    var importedJSON = JSON.parse(body1);

    // Create array of capture years and then find earliest year
    //  and most recent year.
    var yearsArray = Object.keys(importedJSON.captures);
    earliestYear = yearsArray[0];
    latestYear = yearsArray[yearsArray.length - 1];

    // Traverse URL category to find baseline of URL count
    traverse(importedJSON.urls[earliestYear]).forEach(function (node) {
      if (typeof node === 'number') {
        totalUniqueURLs += node;
      }
    });
    debug('Beginning value for total unique urls: ' + totalUniqueURLs);

    traverse(importedJSON.new_urls).forEach(function (node) {
      if (typeof node === 'number') {
        totalUniqueURLs += node;
      }
    });

    debug('Date of first archive: ' + earliestYear);
    debug('Date of last archive: ' + latestYear);
    debug('Total Unique URLs: ' + totalUniqueURLs);

    return getRequest(alexaQueryURL);
  }).then(function (body2) {
    debug('ALEXA RANKINGS');
    var parser = new xml2js.Parser();
    parser.parseString(body2, function (err, result) {
      if (err) {
        console.log("Uh-oh, the XML parser didn't work");
      } else {
        var convertedJSON = JSON.parse(JSON.stringify(result));
        alexaWorldRank = convertedJSON['ALEXA']['SD'][0]['POPULARITY'][0]['$']['TEXT'];
        alexaUSRank = convertedJSON['ALEXA']['SD'][0]['COUNTRY'][0]['$']['RANK'];

        debug('Alexa World Ranking: ' + alexaWorldRank);
        debug('Alexa US Ranking: ' + alexaUSRank);
      }
    });
  }); // End of request
}

function populateSlots (app) {
  let slotScheme = selectors.find(availableSchemes, query.getSlots(app));
  checkSlotScheme(slotScheme);
  let newValues = fillSlots(app, slotScheme);
  // applyDefaultSlots(app, slotScheme.defaults);

  // new values could change actual slot scheme
  const newScheme = selectors.find(availableSchemes, query.getSlots(app));
  if (slotScheme !== newScheme) {
    slotScheme = newScheme;
    // update slots for new scheme
    checkSlotScheme(slotScheme);
    newValues = Object.assign({}, newValues, fillSlots(app, slotScheme));
    // applyDefaultSlots(app, slotScheme.defaults);
  }
  return {slotScheme, newValues};
}

/**
 *
 * @param slotScheme
 */
function checkSlotScheme (slotScheme) {
  if (!slotScheme) {
    throw new Error('There are no valid slot scheme. Need at least default');
  }

  if (slotScheme && slotScheme.name) {
    debug(`we are going with "${slotScheme.name}" slot scheme`);
  }
}
/**
 * Put all received values to slots
 * and return list of new values
 *
 * @param app
 * @returns {{}}
 */
function fillSlots (app, slotScheme) {
  return slotScheme.slots
    .reduce((newValues, slotName) => {
      let value;
      if (app.getArgument) {
        // @deprecated
        value = app.getArgument(slotName);
      } else {
        value = app.params.getByName(slotName);
      }
      if (value) {
        query.setSlot(app, slotName, value);
        newValues[slotName] = value;
      }
      return newValues;
    }, {});
}

module.exports = {
  handler,
  populateSlots,
};
