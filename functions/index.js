/* eslint no-unused-vars: "warn" */
// disabled temporary because we have so much unused variables
// but should be fixed soon

'use strict';
// Bimlendra
const DialogflowApp = require('actions-on-google').DialogflowApp;
const bst = require('bespoken-tools');
const dashbot = require('dashbot')('54mlQ1bEx6WFGlU4A27yHZubsQXvMwYPAqHtxJYg').google;
const functions = require('firebase-functions');
const https = require('https');
const http = require('http');
const replaceall = require('replaceall');
const util = require('util');

const actions = require('./actions/names');
const strings = require('./strings');

// let logless = bst.Logless.middleware("54bcfb2a-a12b-4c6a-8729-a4ad71c06975");

let host = 'web.archive.org';
let imageURL = 'https://archive.org/services/img/';
let podcastAPIURL = '/advancedsearch.php?q=collection:';
let podcastCityAPIURL = '/advancedsearch.php?q=collection:';
let podcastAPIURLNEW = '/advancedsearch.php?q=';
let SeventyEightsAPIURL = '/advancedsearch.php?q=collection:(georgeblood)+AND+subject:';
let APIURLIdentifier = '/metadata/';
let MusicUrlList = [];

let page = 1;
let counter = 0;
let audioURL;
let year = '';
let typeQuery = false;
let searchBYTitle = false;
let PlayAudioByRandomYear = false;
let PlayAudioByRandomCity = false;
let PlayAudioByRandom = false;
let city = '';
let CityName = 'Los Angeles';
let YearName = '1971';
let used = true;
let collection = '';
let collectionQuery = '';
let title = '';
let APIURL = '';
let APIURLIDENTIFIER = '';
let SeventyEights = false;
let OneGoPlayAudioStatus = false;
let OneGoCollectionRandomPlayAudioStatus = false;
let topicName = '';
let TotalTrack = -1;
let IdentifierCount = 0;
logger('Start');

const MEDIA_STATUS_INTENT = actions.mediaStatusInput;

let currentSpeechoutput = -1;
let currentSuggestions = null;
let currentRepromptText = null;

let previousSpeechoutput = -1;
let previousSuggestions = null;

let YearList = [];

const LIST_FALLBACK = [
  strings.fallback.whatWasThat,
  strings.fallback.didntCatchThat,
  strings.fallback.misunderstand
];

const FINAL_FALLBACK = strings.fallback.finalReprompt;

let suggestions = [
  strings.suggestion.artist.gratefulDead,
  strings.suggestion.artist.cowboyJunkies,
  strings.suggestion.artist.dittyBops
];

/**
 * map actions to handlers
 * @type {Map}
 */
const actionMap = new Map();
actionMap.set(actions.noInput, noInput);
actionMap.set(actions.unknownInput, Unknown);
actionMap.set(actions.welcomeInput, Welcome);
//TODO: add all actions here

/**
 * Action Endpoint
 *
 * @type {HttpsFunction}
 */
exports.playMedia = functions.https.onRequest(bst.Logless.capture('54bcfb2a-a12b-4c6a-8729-a4ad71c06975', function (req, res) {
// exports.playMedia = functions.https.onRequest(((req, res) => {
  const app = new DialogflowApp({request: req, response: res});
  if (app.hasSurfaceCapability(app.SurfaceCapabilities.MEDIA_RESPONSE_AUDIO)) {
    app.handleRequest(responseHandler);
  } else {
    app.tell(strings.errors.device.mediaResponse);
  }
  app.data.repetition = Object.assign({}, app.data.repetition, {
    action: app.getIntent(),
  });
  dashbot.configHandler(app);
}));

function init (app) {
  APIURLIdentifier = '/metadata/';
  MusicUrlList = [];
  page = 1;
  counter = 0;
  year = '';
  typeQuery = false;
  searchBYTitle = false;
  PlayAudioByRandomYear = false;
  PlayAudioByRandomCity = false;
  PlayAudioByRandom = false;
  city = '';
  CityName = 'Los Angeles';
  YearName = '1971';
  used = true;
  collection = '';
  collectionQuery = '';
  title = '';
  APIURL = '';
  APIURLIDENTIFIER = '';
  SeventyEights = false;
  OneGoPlayAudioStatus = false;
  OneGoCollectionRandomPlayAudioStatus = false;
  topicName = '';
  TotalTrack = -1;
  IdentifierCount = 0;

  currentSpeechoutput = -1;
  currentSuggestions = null;
  currentRepromptText = null;

  previousSpeechoutput = -1;
  previousSuggestions = null;
  YearList = [];

  // suggestions = ['Grateful Dead', 'Cowboy Junkies', 'Ditty Bops'];
}

function unique (ar) {
  return ar.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

function repeatInput (app) {
  if (currentSpeechoutput === null) {
    play(app, 0);
  } else {
    ask(app, currentSpeechoutput, currentSuggestions);
  }
}

/**
 * repetition action
 *
 * @param state
 * @returns {req.data.repetition|{action, count}|*|string|string|string}
 */
function getRepetitionAction (state) {
  return state.repetition && state.repetition.action;
}

function noInput (app) {
  let count = 0;

  if (getRepetitionAction(app.data) === actions.noInput) {
    count = app.data.repetition.count || 0;
  }

  switch (count) {
    case 0:
      ask(app, strings.errors.noInput.first, suggestions);
      break;
    case 1:
      ask(app, '<speak>' + strings.errors.noInput.reprompt + currentRepromptText + '</speak>', suggestions);
      break;
    default:
      tell(app, FINAL_FALLBACK);
      break;
  }

  app.data.repetition = Object.assign({}, app.data.repetition, {
    count: count + 1,
  });
}

function Unknown (app) {
  let count = 0;

  if (getRepetitionAction(app.data) === actions.unknownInput) {
    count = app.data.repetition.count || 0;
  }

  switch (count) {
    case 0:
      ask(app, '<speak>' + strings.errors.unknownInput.first + '</speak>', suggestions);
      break;
    case 1:
      ask(app, '<speak>' + strings.errors.unknownInput.reprompt + currentRepromptText + '</speak>', suggestions);
      break;
    default:
      tell(app, FINAL_FALLBACK);
      break;
  }

  app.data.repetition = Object.assign({}, app.data.repetition, {
    count: count + 1,
  });
}

function responseHandler (app) {
  // let requestType = (this.event.request !== undefined) ? this.event.request.type : null;

  logger('previousSpeechoutput : ' + previousSpeechoutput);
  logger('previousSuggestions : ' + previousSuggestions);
  logger('currentSpeechoutput : ' + currentSpeechoutput);
  logger('currentSuggestions : ' + currentSuggestions);
  logger('responseHandler : ' + app.getIntent());

  if (app.getIntent() === actions.repeatInput) {
    repeatInput(app);
  } else if (app.getIntent() === actions.discovery) {
    SeventyEights = false;
    Discovery(app);
  } else if (app.getIntent() === actions.playAudio.noOptions) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.searchCollection) {
    TotalTrack = -1;
    SeventyEights = false;
    city = '';
    year = '';
    getCollection(app);
  } else if (app.getIntent() === actions.playAudio.byCity) {
    page = 0;
    MusicUrlList = [];
    TotalTrack = -1;
    IdentifierCount = 0;
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.playAudio.byYearAndCity) {
    page = 0;
    MusicUrlList = [];
    TotalTrack = -1;
    IdentifierCount = 0;
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.playAudio.query) {
    page = 0;
    MusicUrlList = [];
    TotalTrack = 0;
    IdentifierCount = 0;
    typeQuery = false;
    searchBYTitle = true;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.playAudio.random.year) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    PlayAudioByRandomYear = true;
    PlayAudioByRandomCity = false;
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.playAudio.random.city) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = true;
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandom = false;
    OneGoPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.playAudio.random.yearAndCity) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = true;
    OneGoPlayAudioStatus = false;
    typeQuery = false;
    searchBYTitle = false;
    counter = 0;
    SeventyEights = false;
    play(app, 0);
  } else if (app.getIntent() === actions.seventyEights.noOptions) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    counter = 0;
    SeventyEights = true;
    topicName = '';
    playSeventyEights(app, 0);
  } else if (app.getIntent() === actions.seventyEights.byTopic) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    counter = 0;
    SeventyEights = true;
    playSeventyEights(app, 0);
  } else if (app.getIntent() === actions.oneGo.seventyEights) {
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    counter = 0;
    SeventyEights = true;
    playSeventyEights(app, 0);
  } else if (app.getIntent() === actions.oneGo.playAudio) {
    logger('OneGoPlayAudio');
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoCollectionRandomPlayAudioStatus = false;
    counter = 0;
    SeventyEights = false;
    OneGoPlayAudioStatus = true;
    OneGoPlayAudio(app, 0);
  } else if (app.getIntent() === actions.oneGo.randomPlayAudio) {
    logger('OneGoCollectionRandomPlayAudio');
    page = 0;
    TotalTrack = -1;
    IdentifierCount = 0;
    MusicUrlList = [];
    typeQuery = false;
    searchBYTitle = false;
    PlayAudioByRandomYear = false;
    PlayAudioByRandomCity = false;
    PlayAudioByRandom = false;
    OneGoCollectionRandomPlayAudioStatus = true;
    counter = 0;
    SeventyEights = false;
    OneGoPlayAudioStatus = true;
    OneGoPlayAudio(app, 0);
  } else if (app.getIntent() === actions.information.availableYears) {
    let cardTitle = 'Available Years';
    let repromptText = '';
    let speechOutput = '';
    suggestions = [
      strings.suggestion.artist.discoBiscuits,
      strings.suggestion.artist.hotButteredRum,
      strings.suggestion.artist.kellerWilliams
    ];

    if (collection === '') {
      repromptText = "<speak>Please select artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
      speechOutput = "<speak>Please select artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    } else if (city === '') {
      repromptText = '<speak>Please select city first.</speak>';
      speechOutput = '<speak>Please select city first.</speak>';
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    } else if (YearList.length > 0) {
      if (YearList.length === 1) {
        repromptText = '<speak>Available year for ' + city + ' is ' + YearList + ', please select a year.</speak>';
        speechOutput = '<speak>Available year for ' + city + ' is ' + YearList + ', please select a year.</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      }
      if (YearList.length > 1) {
        repromptText = '<speak>Available years for ' + city + ' are ' + YearList + ', please select a year.</speak>';
        speechOutput = '<speak>Available years for ' + city + ' are ' + YearList + ', please select a year.</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      }
    }
  } else if (app.getIntent() === 'SongDetail') {
    let cardTitle = 'Available Years';
    let repromptText = '';
    let speechOutput = '';
    if (MusicUrlList.length >= 1) {
      repromptText = '<speak>You are listening ' + MusicUrlList[counter]['title'] + ', ' + MusicUrlList[counter]['coverage'] + ', ' + MusicUrlList[counter]['year'] + '.</speak>';
      speechOutput = '<speak>You are listening ' + MusicUrlList[counter]['title'] + ', ' + MusicUrlList[counter]['coverage'] + ', ' + MusicUrlList[counter]['year'] + '.</speak>';
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    } else {
      repromptText = '<speak>No song id Playing now. Please select collection first.</speak>';
      speechOutput = '<speak>No song id Playing now. Please select collection first.</speak>';
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    }
  } else if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
    // else if (app.getIntent() === MEDIA_STATUS_INTENT) {
    console.log('PlaybackNearlyFinished');
    // counter++;
    // PlayNext(requestType, 0);
    counter++;
    console.log('counter -' + counter);
    console.log('TotalTrack -' + TotalTrack);
    if (counter > TotalTrack) {
      page++;
      typeQuery = true;
      console.log('true');
    } else {
      console.log('false');
      typeQuery = false;
    }
    console.log('page -' + page);
    console.log('Type -' + typeQuery);

    if (SeventyEights === true) {
      playSeventyEights(app, 0);
    } else {
      // .play(app, 0);
      if (OneGoPlayAudioStatus) {
        OneGoPlayAudio(app, 0);
      } else {
        play(app, 0);
      }
    }
  } else if ((app.getIntent() === 'AMAZON.NextIntent')) {
    if (currentSpeechoutput !== null) {
      repeatInput(app);
    } else if (SeventyEights === true) {
      let cardTitle = 'Available Years';
      let repromptText = '';
      let speechOutput = '';
      if (TotalTrack < 0) {
        repromptText = '<speak>Please Select Topic first</speak>';
        speechOutput = '<speak>Please Select Topic first</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      } else {
        counter++;
        if (counter > (TotalTrack - 1) && TotalTrack >= 0) {
          page++;
          typeQuery = true;
        } else {
          typeQuery = false;
        }

        playSeventyEights(app, 0);
      }
    } else {
      let cardTitle = 'Available Years';
      let repromptText = '';
      let speechOutput = '';
      if (TotalTrack === 0) {
        repromptText = '<speak>Please Select City and year first</speak>';
        speechOutput = '<speak>Please Select City and year first</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      } else {
        counter++;
        if (counter > (TotalTrack - 1) && TotalTrack > 0) {
          page++;
          typeQuery = true;
        } else {
          typeQuery = false;
        }
        if (OneGoPlayAudioStatus) {
          OneGoPlayAudio(app, 0);
        } else {
          play(app, 0);
        }
      }
    }
  } else if (app.getIntent() === 'AMAZON.PreviousIntent') {
    if (previousSpeechoutput === -1) {
      repeatInput(app);
    } else if (previousSpeechoutput !== null) {
      ask(app, previousSpeechoutput, previousSuggestions);
    } else if (SeventyEights === true) {
      if (counter > 0) {
        counter--;
      } else {
        counter = 0;
      }
      playSeventyEights(app, 0);
    } else {
      if (counter > 0) {
        counter--;
      } else {
        counter = 0;
      }
      if (OneGoPlayAudioStatus) {
        OneGoPlayAudio(app, 0);
      } else {
        play(app, 0);
      }
    }
  } else {
    app.handleRequestAsync(actionMap);
  }
}

function getCollection (app) {
  collection = app.getArgument('COLLECTION');
  let collectionRealName = app.getArgument('COLLECTION');
  logger('collection : ' + collection);
  logger('collection_real_name : ' + collection);
  if (collection !== '' || collection !== undefined) {
    collectionQuery = '';
    let collectionArray = collection.split(/[ ,]+/);

    if (collectionArray.length > 1) {
      collectionQuery = collectionQuery + '(';

      for (let i = 1; i < collectionArray.length; i++) {
        collectionQuery = collectionQuery + collectionArray[i];
      }

      collectionQuery = collectionQuery + ')+OR+collection:(';
      for (let i = 0; i < collectionArray.length - 1; i++) {
        collectionQuery = collectionQuery + collectionArray[i];
      }

      collection = collection.replace(/ /g, '');
      collectionQuery = '(' + collectionQuery + ')+OR+collection:(' + collection + ')+OR+collection:(the' + collection + '))';
    } else {
      collection = collection.replace(/ /g, '');
      collectionQuery = '(' + collectionQuery + '(' + collection + ')+OR+collection:(the' + collection + '))';
    }

    let checkCollectionUrl = podcastAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=50&page=0&indent=yes&output=json';
    checkCollectionUrl = customEncodeUri(checkCollectionUrl);
    let optionscheckCollectionUrl = {
      host: host,
      path: checkCollectionUrl,
      method: 'GET',
      headers: {
        'User-Agent': 'Google_Action_Internet_Archive'
      }
    };
    logger(optionscheckCollectionUrl);

    https.get(optionscheckCollectionUrl, function (res) {
      let body = '';
      res.on('data', function (data) {
        body += data;
      });
      CityName = 'Los Angeles';
      YearName = '1971';
      res.on('end', function () {
        logger('Function End');
        let cardTitle = '';
        let repromptText = '';
        let cardOutput = '';
        let speechOutput = '';
        let response = '';
        let resultCollection = parseJsonBody(body);
        logger('resultCollection length : ' + resultCollection['response']['docs'].length);
        if (resultCollection !== null && resultCollection['response']['docs'].length > 0) {
          // http to node server collection title city =null year=null url=checkCollectionUrl resultCollection =result
          for (let i = 0; i < resultCollection['response']['docs'].length; i++) {
            if (resultCollection['response']['docs'][i]['coverage'] !== '' && resultCollection['response']['docs'][i]['coverage'] !== undefined && resultCollection['response']['docs'][i]['year'] !== '' && resultCollection['response']['docs'][i]['year'] !== undefined) {
              if (resultCollection['response']['docs'][i]['coverage'].includes(',')) {
                let resCity = resultCollection['response']['docs'][i]['coverage'].split(',');
                CityName = resCity[0];
                YearName = resultCollection['response']['docs'][i]['year'];
                break;
              }
            }
          }
          cardTitle = 'Provide City and Year';
          repromptText = "<speak>Please select a City and year.<break time='.5s'/> Like " + CityName + ' ' + YearName + "  or <break time='.1s'/>random.</speak>";
          cardOutput = collectionRealName + ' has been selected. Now, please select CITY and YEAR or RANDOM. Like ' + CityName + ' ' + YearName + ' or random.';

          //          speechOutput = "<speak>" + collection_real_name + " has been selected.<break time='.5s'/> Now Please select City and Year or <break time='.1s'/>random. <break time='.5s'/>Like " + //CityName + " " + YearName + " or <break time='.1s'/> random.</speak>";
          speechOutput = '<speak>' + collectionRealName + ' - great choice! Do you have a specific city and year in mind, like ' + CityName + ' ' + YearName + ', or would you like me to play something randomly from ' + collectionRealName + '?</speak>';
          log('The Collection ' + collection + ' has been selected.', collection, null, null, checkCollectionUrl, function (status) {

          });
          suggestions = [CityName + ' ' + YearName, 'Random'];
          askWithReprompt(app, speechOutput, repromptText, suggestions);
        } else {
          cardTitle = 'Collection not exists';
          repromptText = '<speak>' + collectionRealName + ' has no songs. Please try a different artist.</speak>';
          speechOutput = '<speak>Sorry, ' + collectionRealName + " has no song. Please try again by saying<break time='.5s'/> artist name.<break time='.5s'/> Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
          cardOutput = 'Sorry, ' + collectionRealName + ' has no song. Please try again by saying ARTIST NAME like The Ditty Bops, Cowboy Junkies Or Grateful Dead.';

          log('Sorry Collection: ' + collection + ' has no songs.', collection, null, null, checkCollectionUrl, function (status) {

          });
          collection = '';
          askWithReprompt(app, speechOutput, repromptText, suggestions);
        }
      });
    }).on('error', function (e) {
      let cardTitle = '';
      let repromptText = '';
      let cardOutput = '';
      let speechOutput = '';
      let response = '';
      cardTitle = 'Waiting for your response.';
      repromptText = '<speak>Sorry, can you say the artist name again?</speak>';
      speechOutput = '<speak>Sorry, can you say the artist name again?</speak>';
      cardOutput = 'Sorry, unable to understand your request. Please try again by saying ARTIST NAME like The Ditty Bops, Cowboy Junkies, Or Grateful Dead.';

      log('Sorry, Unable to understand your request for collection: ' + collection + ' request ', collection, null, null, checkCollectionUrl, function (status) {
      });
      collection = '';
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    });
  } else {
    let cardTitle = 'Please provide valid artist';
    let repromptText = '<speak>Waiting for your response.</speak>';
    let speechOutput = '<speak>Please provide a artist name.</speak>';
    let cardOutput = 'Please provide an artist name.';

    askWithReprompt(app, speechOutput, repromptText, suggestions);
  }
}

let MyAudioPlayer = function (event, context) {
  this.event = event;
  this.context = context;
};

// SeventyEights
function playSeventyEights (app, offsetInMilliseconds) {
  getAudioPlayListSeventyEights(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
      Obj.context.succeed(response);
    } else {
      Obj.context.succeed(response);
    }
  });
}

function getAudioPlayListSeventyEights (app, counter, thisOBJ, offsetInMilliseconds, callback) {
  let track = counter + 1;
  if ((MusicUrlList.length > 0 && app.getIntent() !== 'SeventyEights' && app.getIntent() !== 'OneGoSeventyEights' && app.getIntent() !== 'PlaByTopic' && typeQuery === false)) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    // logger('test');
    let trackcounter = counter;
    let start = TotalTrack - (MusicUrlList.length - 1);
    let end = TotalTrack;
    let x = Math.floor((Math.random() * end) + start);
    logger('Track - ' + x);
    logger('Start - ' + start);
    logger('End - ' + end);
    trackcounter = x;
    audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
    logger(app.getIntent());
    logger('problem1 : ' + audioURL);
    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
      askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
    } else {
      askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
    }
  } else if (app.getIntent() === 'SeventyEights' || app.getIntent() === 'PlaByTopic' || app.getIntent() === 'OneGoSeventyEights' || typeQuery === true) {
    if (app.getIntent() === 'SeventyEights') {
      logger('into Seventy Eights');
      logger(app.getIntent());
      let cardTitle = 'Collection Seventy Eights Has Been Selected.';
      let repromptText = '<speak>Waiting for your response.</speak>';
      let speechOutput = "<speak>Collection Seventy Eights Has Been Selected.<break time='.1s'/> Please select a topic like Jazz, Instrumental, or Dance</speak>";
      suggestions = ['Jazz', 'Instrumental', 'Dance'];
      askWithReprompt(app, speechOutput, repromptText, suggestions);
    } else if (app.getIntent() === 'PlaByTopic' || typeQuery === true || app.getIntent() === 'OneGoSeventyEights') {
      if (app.getIntent() === 'PlaByTopic' || app.getIntent() === 'OneGoSeventyEights') {
        topicName = title = app.getArgument('TOPIC');
      }

      topicName = topicName.replace(' and ', '#');
      topicName = topicName.replace('&', '#');
      topicName = topicName.replace(/ /g, '');
      topicName = topicName.replace('#', ' ');
      topicName = topicName.replace(/[^a-zA-Z0-9 ]/g, '');
      // APIURL = SeventyEightsAPIURL + '(' + topicName + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      APIURL = SeventyEightsAPIURL + '(' + topicName + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      APIURL = customEncodeUri(APIURL);
      let options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
          'User-Agent': 'Google_Action_Internet_Archive'
        }
      };

      logger(options);
      https.get(options, function (res) {
        let body = '';
        res.on('data', function (data) {
          body += data;
        });
        res.on('end', function () {
          let result = parseJsonBody(body);
          if (result !== null && result['response']['docs'].length > 0) {
            APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
            APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
            let optionsIdentifier = {
              host: host,
              path: APIURLIDENTIFIER,
              method: 'GET',
              headers: {
                'User-Agent': 'Google_Action_Internet_Archive'
              }
            };

            https.get(optionsIdentifier, function (response) {
              let bodyIdentifier = '';
              response.on('data', function (dataIdentifier) {
                bodyIdentifier += dataIdentifier;
              });

              response.on('end', function () {
                let resultIdentifier = JSON.parse(bodyIdentifier);
                if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                  let trackNumber = 0;
                  let lastsongsize = '';
                  for (let i = 0; i < resultIdentifier['result'].length; i++) {
                    if (resultIdentifier['result'][i]['format'] === 'VBR MP3' && lastsongsize !== resultIdentifier['result'][i]['length']) {
                      lastsongsize = resultIdentifier['result'][i]['length'];
                      if (resultIdentifier['result'][i]['title'] === undefined) {
                        trackNumber = trackNumber + 1;
                        MusicUrlList.push({
                          identifier: result['response']['docs'][0]['identifier'],
                          trackName: resultIdentifier['result'][i]['name'],
                          title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                        });
                      } else {
                        trackNumber = trackNumber + 1;
                        resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                        MusicUrlList.push({
                          identifier: result['response']['docs'][0]['identifier'],
                          trackName: resultIdentifier['result'][i]['name'],
                          title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                        });
                      }
                      TotalTrack++;
                    }
                  }
                  // TotalTrack=TotalTrack+MusicUrlList.length-1;
                  // logger('TrackCount -'+TotalTrack);
                  // logger('Array Size -'+MusicUrlList.length);
                  let trackcounter = counter;
                  let start = TotalTrack - (MusicUrlList.length - 1);
                  let end = TotalTrack;
                  let x = Math.floor((Math.random() * end) + start);
                  logger('Track - ' + x);
                  logger('Start - ' + start);
                  logger('End - ' + end);
                  trackcounter = x;
                  audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                  logger('problem2 : ' + audioURL);
                  if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                    askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
                  } else {
                    askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
                  }
                } else {
                  let cardTitle = 'No Songs Found';
                  let repromptText = "<speak>I couldn't find any songs. Please select another topic.</speak>";
                  let speechOutput = '<speak>Sorry, no songs found. Please select another topic like Jazz.</speak>';
                  suggestions = ['Jazz', 'Instrumental', 'Dance'];
                  askWithReprompt(app, speechOutput, repromptText, suggestions);
                }
              });
            }).on('error', function (e) {
              let cardTitle = 'Unable to understand your request. Please try again.';
              let repromptText = '<speak>Waiting for your response.</speak>';
              let speechOutput = '<speak>Sorry, can you say that again?</speak>';
              askWithReprompt(app, speechOutput, repromptText, suggestions);
            });
          } else {
            let cardTitle = 'No Songs Found';
            let repromptText = '<speak>No songs found. Please try again.</speak>';
            let speechOutput = "<speak>Sorry, I couldn't find any songs. Please try again.</speak>";
            askWithReprompt(app, speechOutput, repromptText, suggestions);
          }
        });
      }).on('error', function (e) {
        year = '';
        city = '';
        let cardTitle = 'Unable to understand your request. Please try again.';
        let repromptText = '<speak>Waiting for your response.</speak>';
        let speechOutput = '<speak>Sorry, can you say that again?</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      });
    }
  } else {
    let cardTitle = 'Unable to understand your request.';
    let repromptText = '<speak>Waiting for your response.</speak>';
    let speechOutput = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';

    askWithReprompt(app, speechOutput, repromptText, suggestions);
  }
}
// SeventyEights

function PlayNext (app, requestType, offsetInMilliseconds) {
  let track = counter + 1;
  let prevTrack = counter;
  if (MusicUrlList.length > 0) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    let trackcounter = counter;
    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
      let start = TotalTrack - (MusicUrlList.length - 1);
      let end = TotalTrack;
      let x = Math.floor((Math.random() * end) + start);
      logger('Track - ' + x);
      logger('Start - ' + start);
      logger('End - ' + end);
      trackcounter = x;
      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
      if (PlayAudioByRandomYear === true) {
        log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
        });
      } else if (PlayAudioByRandomCity === true) {
        log('PAuto Next laying Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
        });
      } else if (PlayAudioByRandom === true) {
        log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
        });
      }
    } else {
      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
      log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
      });
    }
    // logger('Auto Next -'+audioURL);
    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
  } else {
    logger('Auto Next - Not Found');
    let cardTitle = 'Unable to understand your request.';
    let repromptText = '<speak>Waiting for your response.</speak>';
    let speechOutput = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';

    askWithReprompt(app, speechOutput, repromptText, suggestions);
  }
}

function logger (strLog) {
  console.log(util.inspect(strLog, false, null));
}

function customEncodeUri (uri) {
  if (uri !== null && uri !== '') {
    return replaceall(' ', '+', uri);
  }
  return '';
}

function getOneGoPlayAudio (app, counter, thisOBJ, offsetInMilliseconds, callback) {
  let track = counter + 1;

  if ((MusicUrlList.length > 0 && app.getIntent() !== 'OneGoPlayAudio' && app.getIntent() !== 'OneGoCollectionRandomPlayAudio' && typeQuery === false)) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    // logger('test');
    let trackcounter = counter;
    if (OneGoCollectionRandomPlayAudioStatus === true) {
      // let start = TotalTrack - (MusicUrlList.length - 1);
      // let end = TotalTrack;
      // let x = Math.floor((Math.random() * end) + start);
      // logger('Track - ' + x);
      // logger('Start - ' + start);
      // logger('End - ' + end);
      // trackcounter = x;
      let x = trackcounter;
      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
      if (OneGoCollectionRandomPlayAudioStatus === true) {
        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
        });
      }
    } else {
      audioURL = 'https://archive.org/download/' + MusicUrlList[trackcounter]['identifier'] + '/' + MusicUrlList[trackcounter]['trackName'];
      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
      });
    }
    // logger(app.getIntent());
    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
    } else {
      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
    }
  } else if (app.getIntent() === 'OneGoPlayAudio' || typeQuery === true || app.getIntent() === 'OneGoCollectionRandomPlayAudio') {
    if (app.getIntent() === 'OneGoPlayAudio' || app.getIntent() === 'OneGoCollectionRandomPlayAudio') {
      if (OneGoCollectionRandomPlayAudioStatus === false) {
        city = app.getArgument('CITY');
        year = app.getArgument('YEAR');
      }
      collection = app.getArgument('COLLECTION');
      let collectionRealName = app.getArgument('COLLECTION');
      if (collection !== null && collection !== '' && collection !== undefined) {
        collectionQuery = '';
        let collectionArray = collection.split(/[ ,]+/);

        if (collectionArray.length > 1) {
          collectionQuery = collectionQuery + '(';

          for (let i = 1; i < collectionArray.length; i++) {
            collectionQuery = collectionQuery + collectionArray[i];
          }

          collectionQuery = collectionQuery + ')+OR+collection:(';
          for (let i = 0; i < collectionArray.length - 1; i++) {
            collectionQuery = collectionQuery + collectionArray[i];
          }

          collection = collection.replace(/ /g, '');
          collectionQuery = '(' + collectionQuery + ')+OR+collection:(' + collection + ')+OR+collection:(the' + collection + '))';
        } else {
          collection = collection.replace(/ /g, '');
          collectionQuery = '(' + collectionQuery + '(' + collection + ')+OR+collection:(the' + collection + '))';
        }

        if (OneGoCollectionRandomPlayAudioStatus === true) {
          APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
        } else {
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
        }
      } else {
        if (used) {
          year = '';
          city = '';
          used = false;
        }
        if (OneGoCollectionRandomPlayAudioStatus === true) {
          APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
        } else {
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
        }
      }
      APIURL = customEncodeUri(APIURL);
      let options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
          'User-Agent': 'Google_Action_Internet_Archive'
        }
      };
      logger(options);
      https.get(options, function (res) {
        let body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end', function () {
          logger('body : ' + body);
          let result = parseJsonBody(body);
          if (result !== null && result['response']['docs'].length > 0) {
            if ((app.getIntent() === 'OneGoPlayAudio') || (app.getIntent() === 'OneGoCollectionRandomPlayAudio') || (((city !== '' && year !== '') || OneGoCollectionRandomPlayAudioStatus === true) && collectionQuery !== '')) {
              if (app.getIntent() === 'OneGoPlayAudio' || app.getIntent() === 'OneGoCollectionRandomPlayAudio' || page === 0) {
                counter = 0;
                MusicUrlList = [];
              }
              if (result['response']['numFound'] < IdentifierCount) {
                used = true;
              } else {
                IdentifierCount++;
              }
              // New Https Request for mp3 tracks
              // track=counter+1;
              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
              APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
              let optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                  'User-Agent': 'Google_Action_Internet_Archive'
                }
              };

              logger(optionsIdentifier);
              https.get(optionsIdentifier, function (response) {
                let bodyIdentifier = '';
                response.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                response.on('end', function () {
                  let resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                    let trackNumber = 0;
                    for (let i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] === 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] === undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        } else {
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    logger('TotalTrack' + TotalTrack);
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    let trackcounter = counter;
                    if (OneGoCollectionRandomPlayAudioStatus === true) {
                      // let start = TotalTrack - (MusicUrlList.length - 1);
                      // let end = TotalTrack;
                      // let x = Math.floor((Math.random() * end) + start);
                      // logger('Track - ' + x);
                      // logger('Start - ' + start);
                      // logger('End - ' + end);
                      // trackcounter = x;
                      let x = trackcounter;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (OneGoCollectionRandomPlayAudioStatus === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }
                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }

                    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    } else {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                  } else {
                    let cardTitle = 'No Songs Found';
                    let repromptText = "<speak>Sorry, I couldn't find any songs. Try a different city or year, or I can play something random for you.</speak>";
                    let speechOutput = "<speak>Sorry, I couldn't find any songs. Try a different city or year, or I can play something random for you.</speak>";
                    let cardOutput = 'Sorry, No songs found. Please try again by saying City and Year or Random';
                    askWithReprompt(app, speechOutput, repromptText, suggestions);
                  }
                });
              }).on('error', function (e) {
                let cardTitle = 'Unable to understand your request. ';
                let repromptText = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
                let speechOutput = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
                let cardOutput = 'Sorry, Unable to understand your request. Please try again by saying City and Year or Random.';
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              });
            }
          } else {
            if (PlayAudioByRandom) {
              log('Sorry , No result found for command play ' + collection + ' random  ', collection, 'random', 'random', APIURL, function (status) {
              });
            } else {
              log('Sorry , No result found for command play ' + collection + ' ' + city + ' ' + year + '   ', collection, city, year, APIURL, function (status) {
              });
            }
            year = '';
            city = '';
            let cardTitle = 'No Songs Found';
            let repromptText = "<speak>Sorry, I couldn't find any songs. Try a different city or year, or I can play something random for you.</speak>";
            let speechOutput = "<speak>Sorry, I couldn't find any songs. Try a different city or year, or I can play something random for you.</speak>";
            let cardOutput = 'Sorry, No songs found. Please try again by saying City and Year or random.';
            askWithReprompt(app, speechOutput, repromptText, suggestions);
          }
        });
      }).on('error', function (e) {
        year = '';
        city = '';
        let cardTitle = 'Unable to understand your request.';
        let repromptText = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
        let speechOutput = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
        let cardOutput = 'Sorry, Unable to understand your request. Please try again by saying City and Year or Random.';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      });
    } else {
      let cardTitle = 'Unable to understand your request.';
      let repromptText = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
      let speechOutput = '<speak>Sorry, can you say your city name and year again? Random is also an option.</speak>';
      let cardOutput = 'Sorry, Unable to understand your request. Please try again by saying City and Year or Random.';

      askWithReprompt(app, speechOutput, repromptText, suggestions);
    }
  }
}

function parseJsonBody (body) {
  logger(body);
  return JSON.parse(body);
}

function Welcome (app) {
  init(app);
  // askAudio(app, "Test Song", "https://ia802307.us.archive.org/20/items/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Booklet/center_vbr.mp3", suggestions);

  let cardTitle = 'Welcome';
  let repromptText = "<speak>Waiting for your response. <break time='.2s'/> What artist would you like to listen to?</speak>";
  let cardOutput = 'Welcome to the live music collection at the Internet Archive. What artist would you like to listen to? For example The Ditty Bops, The Grateful Dead or The Cowboy Junkies.';
  let speechOutput = "<speak><audio src='https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3' />  Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies.  </speak>";
  // let speechOutput = "<speak>Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";

  if (app.getLastSeen() !== null) {
    speechOutput = "<speak>Welcome back, choose an artist.<break time='.5s'/> For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";
  }

  askWithReprompt(app, speechOutput, repromptText, suggestions);
}

function getAudioPlayList (app, counter, thisOBJ, offsetInMilliseconds, callback) {
  if (collection !== '' || searchBYTitle) {
    let track = counter + 1;

    if ((MusicUrlList.length > 0 && app.getIntent() !== 'PlayAudio' && app.getIntent() !== 'PlayAudioByRandom' && app.getIntent() !== 'PlayAudioByCity' && app.getIntent() !== 'PlayAudioByRandomYear' && app.getIntent() !== 'PlayAudioByRandomCity' && app.getIntent() !== 'PlayAudioQuery' && typeQuery === false)) {
      if (track > MusicUrlList.length) {
        counter = 0;
        track = counter + 1;
      }
      // logger('test');
      let trackcounter = counter;
      if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
        let start = TotalTrack - (MusicUrlList.length - 1);
        let end = TotalTrack;
        let x = Math.floor((Math.random() * end) + start);
        logger('Track - ' + x);
        logger('Start - ' + start);
        logger('End - ' + end);
        trackcounter = x;
        audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
        if (PlayAudioByRandomYear === true) {
          log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
          });
        } else if (PlayAudioByRandomCity === true) {
          log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
          });
        } else if (PlayAudioByRandom === true) {
          log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
          });
        }
      } else {
        audioURL = 'https://archive.org/download/' + MusicUrlList[trackcounter]['identifier'] + '/' + MusicUrlList[trackcounter]['trackName'];
        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
        });
      }
      // logger(app.getIntent());
      if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
        logger('autoNext');
        askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      } else {
        logger('!autoNext');
        askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      }
    } else if (app.getIntent() === 'PlayAudio' || app.getIntent() === 'PlayAudioByCity' || app.getIntent() === 'PlayAudioByRandom' || app.getIntent() === 'PlayAudioByRandomYear' || app.getIntent() === 'PlayAudioByRandomCity' || app.getIntent() === 'PlayAudioByYearCity' || app.getIntent() === 'PlayAudioQuery' || typeQuery === true) {
      if (searchBYTitle || app.getIntent() === 'PlayAudioQuery') {
        if (app.getIntent() === 'PlayAudioQuery') {
          title = app.getArgument('TITLE');
        }
        APIURL = podcastAPIURLNEW + title + '%20AND(mediatype:audio)&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandomYear || app.getIntent() === 'PlayAudioByRandomYear') {
        if (app.getIntent() === 'PlayAudioByRandomYear') {
          city = app.getArgument('CITY');
        }
        APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage:(' + city + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandom || app.getIntent() === 'PlayAudioByRandom') {
        APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandomCity || app.getIntent() === 'PlayAudioByRandomCity') {
        if (app.getIntent() === 'PlayAudioByRandomCity') {
          year = app.getArgument('YEAR');
        }
        APIURL = podcastAPIURL + collectionQuery + '+AND+year:(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else {
        if (used) {
          year = '';
          city = '';
          used = false;
        }

        if (app.getIntent() === 'PlayAudioByYearCity') {
          year = app.getArgument('YEAR');
          city = app.getArgument('CITY');
        } else if (app.getIntent() === 'PlayAudio') {
          year = app.getArgument('YEAR');
          APIURL = podcastAPIURL + collectionQuery + '+AND+year:(' + year + ')';
        } else if (app.getIntent() === 'PlayAudioByCity') {
          city = app.getArgument('CITY');
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')';
        }

        if (year !== '' && city !== '') {
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')';
        }
        if (app.getIntent() === 'PlayAudioByCity') {
          APIURL = APIURL + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=50&page=' + page + '&indent=yes&output=json';
        } else {
          APIURL = APIURL + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
        }
      }
      APIURL = customEncodeUri(APIURL);
      let options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
          'User-Agent': 'Google_Action_Internet_Archive'
        }
      };
      logger(options);
      https.get(options, function (res) {
        let body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end', function () {
          let result = parseJsonBody(body);
          if (result !== null && result['response']['docs'].length > 0) {
            if ((app.getIntent() === 'PlayAudioByCity' || app.getIntent() === 'PlayAudio') && (year === '' || city === '')) {
              let YearString = '';
              let CityList = [];
              let CityString = '';
              if (app.getIntent() === 'PlayAudioByCity' && year === '') {
                for (let i = 0; i < result['response']['docs'].length; i++) {
                  YearList.push(result['response']['docs'][i]['year']);
                }
                YearList = unique(YearList);
                YearList = YearList.sort();

                // for (let i = 0; i < YearList.length; i++) {
                //   YearString = YearString + YearList[i] + ', ';
                // }

                let cardTitle = 'Please select a year.';
                let repromptText = '<speak> Waiting for your response.</speak>';
                let speechOutput = '<speak> Year list for ' + city + ' is not available. Please select random.</speak>';

                if (YearList.length === 1) {
                  YearString = YearList[0];
                  speechOutput = '<speak> Ok, Grateful Dead has played in ' + city + ' in ' + YearString + '. Do you have a particular year in mind?</speak>';
                } else if (YearList.length > 1) {
                  YearString = YearList[0] + ' to ' + YearList[YearList.length - 1];
                  speechOutput = '<speak> Ok, Grateful Dead has played in ' + city + ' sometime between ' + YearString + '. Do you have a particular year in mind?</speak>';
                }

                log('Ok, for ' + collection + ' in ' + city + ' I have music from ' + YearString, collection, city, year, APIURL, function (status) {
                });
                suggestions = YearList;
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              } else if (app.getIntent() === 'PlayAudio' && city === '') {
                for (let i = 0; i < result['response']['docs'].length; i++) {
                  CityList.push(result['response']['docs'][i]['coverage']);
                }

                CityList = unique(CityList);
                CityList = CityList.sort();
                for (let i = 0; i < CityList.length; i++) {
                  CityString = CityString + CityList[i] + ', ';
                }

                let cardTitle = 'Please Select City.';
                let repromptText = '<speak> Waiting for your response.</speak>';
                let speechOutput = '<speak>Ok, for ' + year + ' I have music from ' + CityString + ' Please select a city.</speak> ';
                log('Ok , available cities for artist: ' + collection + ' and year: ' + year + ' are ' + CityString, collection, city, year, APIURL, function (status) {
                });
                suggestions = CityList;
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              }
            } else if ((app.getIntent() === 'PlayAudioByYearCity') || (city !== '' && year !== '')) {
              if (app.getIntent() === 'PlayAudioByYearCity' || page === 0) {
                counter = 0;
                MusicUrlList = [];
              }
              if (result['response']['numFound'] < IdentifierCount) {
                used = true;
              } else {
                IdentifierCount++;
              }
              // New Https Request for mp3 tracks
              // track=counter+1;
              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
              APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
              let optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                  'User-Agent': 'Google_Action_Internet_Archive'
                }
              };

              logger(optionsIdentifier);
              https.get(optionsIdentifier, function (response) {
                let bodyIdentifier = '';
                response.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                response.on('end', function () {
                  let resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                    let trackNumber = 0;
                    for (let i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] === 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] === undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        } else {
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    logger('TotalTrack' + TotalTrack);
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    let trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      let start = TotalTrack - (MusicUrlList.length - 1);
                      let end = TotalTrack;
                      let x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }
                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }

                    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                      logger(MEDIA_STATUS_INTENT);
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    } else {
                      logger('audio url : ' + audioURL);
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                  } else {
                    let cardTitle = 'No Songs Found';
                    let repromptText = "<speak>Sorry, I couldn't find any songs. Please try a different city and year, or say random.</speak>";
                    let speechOutput = "<speak>Sorry, I couldn't find any songs. Please try a different city and year, or say random.</speak>";
                    askWithReprompt(app, speechOutput, repromptText, suggestions);
                  }
                });
              }).on('error', function (e) {
                let cardTitle = 'Unable to understand your request. ';
                let repromptText = '<speak>Waiting for your response.</speak>';
                let speechOutput = '<speak>Sorry, could you repeat that?</speak>';
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              });
            } else if (app.getIntent() === 'PlayAudioQuery' || searchBYTitle) {
              if (app.getIntent() === 'PlayAudioQuery') {
                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              for (let i = 0; i < result['response']['docs'].length; i++) {
                MusicUrlList.push({
                  identifier: result['response']['docs'][i]['identifier'],
                  trackName: MusicUrlList[counter]['identifier'] + '_vbr.m3u',
                  title: result['response']['docs'][i]['title'],
                  coverage: (result['response']['docs'][i]['coverage']) ? result['response']['docs'][i]['coverage'] : 'Coverage Not mentioned',
                  year: (result['response']['docs'][i]['year']) ? result['response']['docs'][i]['year'] : 'Year Not mentioned'
                });
              }

              log('Result for search ' + title, collection, null, null, APIURL, function (status) {
              });
              let trackcounter = counter;
              if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                let start = page * 50;
                let end = (page * 50) + MusicUrlList.length - 1;
                let x = Math.floor((Math.random() * end) + start);
                logger('Track - ' + x);
                logger('Start - ' + start);
                logger('End - ' + end);
                trackcounter = x;
                audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                if (PlayAudioByRandomYear === true) {
                  log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                  });
                } else if (PlayAudioByRandomCity === true) {
                  log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                  });
                } else if (PlayAudioByRandom === true) {
                  log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                  });
                }
              } else {
                audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                });
              }

              if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
              } else {
                askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
              }
            } else if (app.getIntent() === 'PlayAudioByRandomYear' || PlayAudioByRandomYear) {
              if (app.getIntent() === 'PlayAudioByRandomYear') {
                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
              APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
              let optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                  'User-Agent': 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (response) {
                let bodyIdentifier = '';
                response.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                response.on('end', function () {
                  let resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                    let trackNumber = 0;
                    for (let i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] === 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] === undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    //   TotalTrack=TotalTrack+MusicUrlList.length-1;

                    let trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      let start = TotalTrack - (MusicUrlList.length - 1);
                      let end = TotalTrack;
                      let x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }
                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }

                    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    } else {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                  } else {
                    let trackcounter = counter;
                    let cardTitle = 'No Songs Found';
                    let repromptText = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
                    let speechOutput = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
                    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                  }
                });
              }).on('error', function (e) {
                let cardTitle = 'Unable to understand your request.';
                let repromptText = '<speak>Sorry, could you repeat that?</speak>';
                let speechOutput = '<speak>Sorry, could you repeat that?</speak>';
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              });
            } else if (app.getIntent() === 'PlayAudioByRandomCity' || PlayAudioByRandomYear) {
              if (app.getIntent() === 'PlayAudioByRandomCity') {
                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
              APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
              let optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                  'User-Agent': 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (response) {
                let bodyIdentifier = '';
                response.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                response.on('end', function () {
                  let resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                    let trackNumber = 0;
                    for (let i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] === 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] === undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    let trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      let start = TotalTrack - (MusicUrlList.length - 1);
                      let end = TotalTrack;
                      let x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }
                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }

                    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    } else {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                  } else {
                    let cardTitle = 'No Songs Found';
                    let repromptText = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
                    let speechOutput = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
                    askWithReprompt(app, speechOutput, repromptText, suggestions);
                  }
                });
              }).on('error', function (e) {
                let cardTitle = 'Unable to understand your request.';
                let repromptText = '<speak>Sorry, can you repeat that?</speak>';
                let speechOutput = '<speak>Sorry, can you repeat that?</speak>';
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              });
            } else if (app.getIntent() === 'PlayAudioByRandom' || PlayAudioByRandom) {
              if (app.getIntent() === 'PlayAudioByRandom') {
                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
              APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER);
              let optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                  'User-Agent': 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (response) {
                let bodyIdentifier = '';
                response.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                response.on('end', function () {
                  let resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier !== null && resultIdentifier['result'].length > 0) {
                    let trackNumber = 0;
                    for (let i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] === 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] === undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, '');
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                            coverage: (result['response']['docs'][0]['coverage']) ? result['response']['docs'][0]['coverage'] : 'Coverage Not mentioned',
                            year: (result['response']['docs'][0]['year']) ? result['response']['docs'][0]['year'] : 'Year Not mentioned'
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;
                    // logger('TrackCount -'+TotalTrack);
                    // logger('Array Size -'+MusicUrlList.length);
                    let trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      let start = TotalTrack - (MusicUrlList.length - 1);
                      let end = TotalTrack;
                      let x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom === true) {
                        log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }
                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log('Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }

                    if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument('MEDIA_STATUS').extension.status === app.Media.Status.FINISHED)) {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    } else {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                  } else {
                    let cardTitle = 'No Songs Found';
                    let repromptText = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
                    let speechOutput = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";

                    askWithReprompt(app, speechOutput, repromptText, suggestions);
                  }
                });
              }).on('error', function (e) {
                let cardTitle = 'Unable to understand your request.';
                let repromptText = '<speak>Sorry, can you say that again?</speak>';
                let speechOutput = '<speak>Sorry, can you say that again?</speak>';
                askWithReprompt(app, speechOutput, repromptText, suggestions);
              });
            }
          } else {
            if (PlayAudioByRandom) {
              log('Sorry , No result found for command play ' + collection + ' random  ', collection, 'random', 'random', APIURL, function (status) {
              });
            } else {
              log('Sorry , No result found for command play ' + collection + ' ' + city + ' ' + year + '   ', collection, city, year, APIURL, function (status) {
              });
            }

            let cardTitle = 'No Songs Found';
            let repromptText = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
            let speechOutput = checkYear(year);
            if (speechOutput === '') {
              speechOutput = "<speak>Sorry, I couldn't find any songs. Please try a different city or year, or say random.</speak>";
            }
            // year = '';
            // city = '';
            askWithReprompt(app, speechOutput, repromptText, suggestions);
          }
        });
      }).on('error', function (e) {
        year = '';
        city = '';
        let cardTitle = 'Unable to understand your request.';
        let repromptText = '<speak>Sorry, can you say that again?</speak>';
        let speechOutput = '<speak>Sorry, can you say that again?</speak>';
        askWithReprompt(app, speechOutput, repromptText, suggestions);
      });
    } else {
      let cardTitle = 'Unable to understand your request.';
      let repromptText = '<speak>Sorry, can you say that again?</speak>';
      let speechOutput = '<speak>Sorry, can you say that again?</speak>';

      askWithReprompt(app, speechOutput, repromptText, suggestions);
    }
  } else {
    let cardTitle = 'Please select artist';
    let repromptText = "<speak>Please say an artist name.<break time='.1s'/> Like The Ditty Bops,<break time='.1s'/> Or Cowboy Junkies,<break time='.1s'/> or Grateful Dead.</speak>";
    let speechOutput = "<speak>Please say an artist name.<break time='.1s'/> Like The Ditty Bops,<break time='.1s'/> Or Cowboy Junkies,<break time='.1s'/> or Grateful Dead.</speak>";

    askWithReprompt(app, speechOutput, repromptText, suggestions);
  }
}

function checkYear (year) {
  let speechOutput = '';
  if (YearList.length > 0 && YearList.indexOf(year) < 0) {
    let tempYearList = [];
    tempYearList.push(YearList);
    tempYearList.push(year);
    tempYearList = unique(tempYearList);
    tempYearList = tempYearList.sort();
    let yearIndex = tempYearList.indexOf(year);
    // speechOutput = tempYearList;
    logger('yearIndex : ' + yearIndex);
    logger('tempYearList : ' + tempYearList);
    if (yearIndex > 0 && yearIndex < tempYearList.length - 1) {
      speechOutput = '<speak> I don’t have anything for ' + year + '. The two closest years for ' + city + '. I would have are in ' + tempYearList[yearIndex - 1] + ' or ' + tempYearList[yearIndex + 1] + '. Which year would you like? </speak>';
    } else if (yearIndex === 0 || yearIndex === tempYearList.length - 1) {
      speechOutput = '<speak> I don’t have anything for ' + year + '. Please select within suggested range. </speak>';
      let YearString = '';
      if (YearList.length === 1) {
        YearString = YearList[0];
        speechOutput = '<speak> I don’t have anything for ' + year + '. Available year for ' + city + ' is ' + YearString + '.</speak>';
      } else if (YearList.length > 1) {
        YearString = YearList[0] + ' to ' + YearList[YearList.length - 1];
        speechOutput = '<speak> I don’t have anything for ' + year + '. Available years for ' + city + ' are ' + YearString + '.</speak>';
      }
    }
  }
  return speechOutput;
}

function handleSessionEndRequest (app) {
  let cardTitle = 'Good bye';
  let speechOutput = '<speak>Thanks for rocking with the Internet Archive’s live music collection!</speak>';
  let repromptText = '<speak>Thanks for rocking with the Internet Archive’s live music collection!</speak>';
  askWithReprompt(app, speechOutput, repromptText, suggestions);
}

function log (Title, Collection, City, Year, Url, callback) {
  let url = 'http://alexa.appunison.in:5557/admin/savelog?identifierName=' + Collection + '&title=' + Title + '&city=' + City + '&year=' + Year + '&url=' + Url + '&resltJson=null';
  logger(url);
}

function log1 (Title, Collection, City, Year, Url, callback) {
  let url = 'http://alexa.appunison.in:5557/admin/savelog?identifierName=' + Collection + '&title=' + Title + '&city=' + City + '&year=' + Year + '&url=' + Url + '&resltJson=null';
  logger(url);
  http.get(url, function (res) {
    let body = '';
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      callback();
    });
  }).on('error', function (e) {
    callback(null, e);
  });
}

function Discovery (app) {
  let cardTitle = 'Discover more';
  let repromptText = "<speak>Waiting for your response.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/> Like , Disco Biscuits, Hot Buttered Rum, or Keller Williams.</speak>";
  // let speechOutput = "<speak>Welcome To The Internet Archive,<break time='1s'/> Please select a collection by saying<break time='.5s'/> play Collection name.<break time='.5s'/> like Play The Ditty Bops,<break time='.5s'/> Or Play Cowboy Junkies.<break time='.5s'/> Or Play Grateful Dead.</speak>";
  let cardOutput = 'We have more collection like Disco Biscuits, Hot Buttered Rum or Keller Williams.';
  let speechOutput = '<speak>We have more collections like Disco Biscuits, Hot Buttered Rum, or Keller Williams.</speak>';
  suggestions = ['Disco Biscuits', 'Hot Buttered Rum', 'Keller Williams'];
  askWithReprompt(app, speechOutput, repromptText, suggestions);
}

function OneGoPlayAudio (app, offsetInMilliseconds) {
  getOneGoPlayAudio(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
      Obj.context.succeed(response);
    } else {
      Obj.context.succeed(response);
    }
  });
}

function play (app, offsetInMilliseconds) {
  getAudioPlayList(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
      logger('!Error : ' + response);
    } else {
      logger('Error : ' + response);
    }
  });
}

function tell (app, speechOutput) {
  app.tell(app.buildRichResponse()
    .addSimpleResponse(speechOutput));
}

function askWithReprompt (app, speechOutput, repromptText, suggestions) {
  currentRepromptText = repromptText;
  ask(app, speechOutput, suggestions);
}

function ask (app, speechOutput, suggestions) {
  if (speechOutput !== currentSpeechoutput) {
    previousSpeechoutput = currentSpeechoutput;
    previousSuggestions = currentSuggestions;
    currentSpeechoutput = speechOutput;
    currentSuggestions = suggestions;
  }
  app.ask(app.buildRichResponse()
    .addSimpleResponse(speechOutput)
    .addSuggestions(suggestions));
}

function askAudioWithoutCoverageYear (app, identifier, track, title, coverage, year, audioURL, suggestions) {
  logger('Current Song Without Coverage : ' + counter + '/' + MusicUrlList.length);
  previousSpeechoutput = currentSpeechoutput;
  previousSuggestions = currentSuggestions;
  currentSpeechoutput = null;
  currentSuggestions = null;

  logger('audioURL : ' + audioURL);

  app.ask(app.buildRichResponse()
    .addSimpleResponse('Playing track - ' + title)
    .addMediaResponse(app.buildMediaResponse()
      .addMediaObjects([app.buildMediaObject('Playing track number - ' + track, audioURL)
        .setDescription('Playing track - ' + title)
        // .setImage(imageURL+replaceall(" ", "", collection), app.Media.ImageType.LARGE)
        // .setImage(imageURL+identifier, app.Media.ImageType.LARGE)
        .setImage('http://archive.org/images/notfound.png', app.Media.ImageType.LARGE)
        // .setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/1200px-Internet_Archive_logo_and_wordmark.svg.png", app.Media.ImageType.SMALL)
      ])
    ).addSuggestions(suggestions)
    .addSuggestionLink('on Archive.org', audioURL));
}

function askAudio (app, identifier, track, title, coverage, year, audioURL, suggestions) {
  logger('Current Song With Coverage : ' + counter + '/' + MusicUrlList.length);
  previousSpeechoutput = currentSpeechoutput;
  previousSuggestions = currentSuggestions;
  currentSpeechoutput = null;
  currentSuggestions = null;

  logger('audioURL : ' + audioURL);

  // To Log Request to Kibana
  logKibana(function (status) {
  });

  app.ask(app.buildRichResponse()
    .addSimpleResponse('Playing track - ' + title + ', ' + coverage + ', ' + year)
    .addMediaResponse(app.buildMediaResponse()
      .addMediaObjects([app.buildMediaObject('Playing track number - ' + track, audioURL)
        .setDescription('Playing track - ' + title + ', ' + coverage + ', ' + year)
        // .setImage(imageURL+identifier, app.Media.ImageType.LARGE)
        .setImage('http://archive.org/images/notfound.png', app.Media.ImageType.LARGE)
        //  .setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/1200px-Internet_Archive_logo_and_wordmark.svg.png", app.Media.ImageType.SMALL)
      ])
    ).addSuggestions(suggestions)
    .addSuggestionLink('on Archive.org', audioURL));
}

function PlayNextSong (app, requestType, offsetInMilliseconds) {
  let track = counter + 1;
  let prevTrack = counter;
  if (MusicUrlList.length > 0) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    let trackcounter = counter;
    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
      let start = TotalTrack - (MusicUrlList.length - 1);
      let end = TotalTrack;
      let x = Math.floor((Math.random() * end) + start);
      logger('Track - ' + x);
      logger('Start - ' + start);
      logger('End - ' + end);
      trackcounter = x;
      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
      if (PlayAudioByRandomYear === true) {
        log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
        });
      } else if (PlayAudioByRandomCity === true) {
        log('PAuto Next laying Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
        });
      } else if (PlayAudioByRandom === true) {
        log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
        });
      }
    } else {
      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
      log('Auto Next Playing Track URL - ' + audioURL + ' And Track Name - ' + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
      });
    }
    // logger('Auto Next -'+audioURL);
    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
  } else {
    logger('Auto Next - Not Found');
    let cardTitle = 'Unable to understand your request.';
    let repromptText = '<speak>Sorry, can you say that again?</speak>';
    let speechOutput = '<speak>Sorry, can you say that again?</speak>';

    askWithReprompt(app, speechOutput, repromptText, suggestions);
  }
}

function logKibana (callback) {
  // To Log Request to Kibana
  let options = {
    host: host,
    path: APIURL,
    method: 'GET',
    headers: {
      'User-Agent': 'Google_Action_Internet_Archive'
    }
  };
  https.get(options, function (res) {
    let body = '';
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      callback();
    });
  }).on('error', function (e) {
    callback(null, e);
  });
  // To Log Request to Kibana
}
