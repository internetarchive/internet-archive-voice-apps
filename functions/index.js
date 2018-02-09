'use strict';
//Bimlendra
var https = require('https');
var http = require('http');
const util = require('util');
const dashbot = require('dashbot')('54mlQ1bEx6WFGlU4A27yHZubsQXvMwYPAqHtxJYg').google;
var bst = require('bespoken-tools');
//var logless = bst.Logless.middleware("54bcfb2a-a12b-4c6a-8729-a4ad71c06975");

var replaceall = require("replaceall");


var host='web.archive.org';
var lastPlayedByUser = {};
var imageURL = "https://archive.org/services/img/";
var podcastAPIURL = "/advancedsearch.php?q=collection:";
var podcastCityAPIURL = "/advancedsearch.php?q=collection:";
var podcastAPIURLNEW = "/advancedsearch.php?q=";
var SeventyEightsAPIURL = "/advancedsearch.php?q=collection:(georgeblood)+AND+subject:";
var APIURLIdentifier = "/metadata/";
var MusicUrlList = [];

var page = 1;
var counter = 0;
var audioURL;
var year = '';
var typeQuery = false;
var searchBYTitle = false;
var PlayAudioByRandomYear = false;
var PlayAudioByRandomCity = false;
var PlayAudioByRandom = false;
var city = '';
var CityName = 'Los Angeles';
var YearName = '1971';
var used = true;
var collection = '';
var collectionQuery = '';
var title = '';
var APIURL = '';
var APIURLIDENTIFIER = '';
var SeventyEights = false;
var OneGoPlayAudioStatus=false;
var OneGoCollectionRandomPlayAudioStatus=false;
var topicName = '';
var TotalTrack = -1;
var IdentifierCount = 0;
const functions = require('firebase-functions');
const DialogflowApp  = require('actions-on-google').DialogflowApp ;
logger('Start');

const WELCOME_INTENT = 'input.welcome';
const TEXT_INTENT = 'input.text';
const UNKNOWN_INTENT = 'input.unknown';
const MEDIA_STATUS_INTENT = 'media_status_update';

var currentSpeechoutput = -1;
var currentSuggestions = null;

var previousSpeechoutput = -1;
var previousSuggestions = null;

var YearList = [];

const LIST_FALLBACK= [
    "Sorry, what was that?",
    "I didn't catch that. Could you tell me which one you liked?",
    "I'm having trouble understanding you. Which one of those did you like?"
  ];

const FINAL_FALLBACK= "I'm sorry I'm having trouble here. Maybe we should try this again later.";



var suggestions = ["Grateful Dead", "Cowboy Junkies", "Ditty Bops"];



exports.playMedia = functions.https.onRequest(bst.Logless.capture("54bcfb2a-a12b-4c6a-8729-a4ad71c06975", function(req, res) {
//exports.playMedia = functions.https.onRequest((req, res) => {

	
  const app = new DialogflowApp ({request: req, response: res});
  dashbot.configHandler(app);
 if (app.hasSurfaceCapability(app.SurfaceCapabilities.MEDIA_RESPONSE_AUDIO)) {
  app.handleRequest(responseHandler);
 }
  else {
    app.tell("Sorry, your device doesn't support media response.");
  }
}));

function init(app) {

 host='web.archive.org';
 lastPlayedByUser = {};
 podcastAPIURL = "/advancedsearch.php?q=collection:";
 podcastCityAPIURL = "/advancedsearch.php?q=collection:";
 podcastAPIURLNEW = "/advancedsearch.php?q=";
 SeventyEightsAPIURL = "/advancedsearch.php?q=collection:(georgeblood)+AND+subject:";
 APIURLIdentifier = "/metadata/";
 MusicUrlList = [];
 page = 1;
 counter = 0;
 audioURL;
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
 OneGoPlayAudioStatus=false;
 OneGoCollectionRandomPlayAudioStatus=false;
 topicName = '';
 TotalTrack = -1;
 IdentifierCount = 0;

 currentSpeechoutput = -1;
 currentSuggestions = null;

 previousSpeechoutput = -1;
 previousSuggestions = null;
YearList = [];

 suggestions = ["Grateful Dead", "Cowboy Junkies", "Ditty Bops"];

}

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

function repeatInput (app) {
if(currentSpeechoutput === null) {
     play(app, 0);
}
else {
	ask(app, currentSpeechoutput, currentSuggestions);
}
    }

function noInput (app) {
app.data.noInputCount = parseInt(app.data.noInputCount, 10);


  if (app.data.noInputCount == 0) {
  //ask(app, LIST_FALLBACK[app.data.noInputCount++], suggestions);
  app.data.noInputCount++;
	ask(app, `What was that?`, suggestions);
  //app.data.noInputCount = parseInt(app.data.noInputCount, 10);
  }
else if(app.data.noInputCount == 1) {
  ask(app, "<speak>Sorry, I still didn’t get that. Please try again by saying artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>", suggestions);
}
 else {
    tell(app, FINAL_FALLBACK);
  }
}


function noInput1 (app) {
logger("RepromptCount : "+app.getRepromptCount());
      if (app.getRepromptCount() === 0) {
	ask(app, `What was that?`, suggestions);
      } else if (app.getRepromptCount() === 1) {
	ask(app, `Sorry I didn't catch that. Could you repeat yourself?`, suggestions);
      } else if (app.isFinalReprompt()) {
	tell(app, `Okay let's try this again later.`);
      } 
    }



function Unknown1(app) {
 var speechOutput = "<speak>Sorry, Unable to understand your request. Please try again by saying artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
  ask(app, speechOutput, suggestions);
}

function Unknown (app) {
app.data.unknownInputCount = parseInt(app.data.unknownInputCount, 10);


  if (app.data.unknownInputCount == 0) {
  //ask(app, LIST_FALLBACK[app.data.unknownInputCount++], suggestions);
  app.data.unknownInputCount++;

  ask(app, "<speak>Sorry, which artist?</speak>", suggestions);
  //app.data.unknownInputCount = parseInt(app.data.unknownInputCount, 10);
  } 
else if(app.data.unknownInputCount == 1) {
  ask(app, "<speak>Sorry, I still didn’t get that. Please provide an artist name, like The Ditty Bops,<break time='.5s'/> Cowboy Junkies,<break time='.5s'/> or Grateful Dead.</speak>", suggestions);
  }
else {
    tell(app, FINAL_FALLBACK);
  }
}


function responseHandler (app) {
  //var requestType = (this.event.request != undefined) ? this.event.request.type : null;

      logger('previousSpeechoutput : '+previousSpeechoutput);
      logger('previousSuggestions : '+previousSuggestions);
      logger('currentSpeechoutput : '+currentSpeechoutput);
      logger('currentSuggestions : '+currentSuggestions);
      logger('responseHandler : '+app.getIntent());
	logger('noInputCount : '+app.data.noInputCount);

if (app.getIntent() === 'No.Input') {
      noInput(app);
app.data.unknownInputCount = 0;
    }	
else if (app.getIntent() === UNKNOWN_INTENT) {
      Unknown(app);
app.data.noInputCount = 0;
    }	
else {
app.data.noInputCount = 0;
app.data.unknownInputCount = 0;
	if (app.getIntent() === 'Repeat.Input') {
      repeatInput(app);

    }	
	
	
	else if (app.getIntent() === WELCOME_INTENT) {
      SeventyEights = false;
      Welcome(app);

    }
    else if (app.getIntent() === 'Discovery') {
      SeventyEights = false;
      Discovery(app);

    }
    else if (app.getIntent() === "PlayAudio") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      typeQuery = false;
      searchBYTitle = false;
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "SearchCollection") {
      TotalTrack = -1;
      SeventyEights = false;
      city = '';
      year = '';
      getCollection(app);
    }
    else if (app.getIntent() === "PlayAudioByCity") {
      page = 0;
      MusicUrlList = [];
      TotalTrack = -1;
      IdentifierCount = 0;
      typeQuery = false;
      searchBYTitle = false;
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "PlayAudioByYearCity") {
      page = 0;
      MusicUrlList = [];
      TotalTrack = -1;
      IdentifierCount = 0;
      typeQuery = false;
      searchBYTitle = false;
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "PlayAudioQuery") {
      page = 0;
      MusicUrlList = [];
      TotalTrack = 0;
      IdentifierCount = 0;
      typeQuery = false;
      searchBYTitle = true;
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "PlayAudioByRandomYear") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      PlayAudioByRandomYear = true;
      PlayAudioByRandomCity = false;
      typeQuery = false;
      searchBYTitle = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "PlayAudioByRandomCity") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = true;
      typeQuery = false;
      searchBYTitle = false;
      PlayAudioByRandom = false;
      OneGoPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "PlayAudioByRandom") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      PlayAudioByRandomYear = false;
      PlayAudioByRandomCity = false;
      PlayAudioByRandom = true;
      OneGoPlayAudioStatus=false;
      typeQuery = false;
      searchBYTitle = false;
      counter = 0;
      SeventyEights = false;
      play(app, 0);

    }
    else if (app.getIntent() === "SeventyEights") {
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

    }
    else if (app.getIntent() === "PlaByTopic") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      typeQuery = false;
      searchBYTitle = false;
      counter = 0;
      SeventyEights = true;
      playSeventyEights(app, 0);

    }
	else if (app.getIntent() === "OneGoSeventyEights") {
      page = 0;
      TotalTrack = -1;
      IdentifierCount = 0;
      MusicUrlList = [];
      typeQuery = false;
      searchBYTitle = false;
      counter = 0;
      SeventyEights = true;
      playSeventyEights(app, 0);

    }
	else if (app.getIntent() === "OneGoPlayAudio") {
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
      OneGoCollectionRandomPlayAudioStatus=false;
      counter = 0;
      SeventyEights = false;
      OneGoPlayAudioStatus=true;
      OneGoPlayAudio(app, 0);

    }else if (app.getIntent() === "OneGoCollectionRandomPlayAudio") {
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
      OneGoCollectionRandomPlayAudioStatus=true;
      counter = 0;
      SeventyEights = false;
      OneGoPlayAudioStatus=true;
      OneGoPlayAudio(app, 0);

    }
	else if (app.getIntent() === 'SongAvailableYears') {
      if(collection == ''){
	ask(app, "<speak>Please select artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>");
	}
	else if(city == ''){
	ask(app, "<speak>Please select city first.</speak>");
	}
	else if(YearList.length>0){
	if(YearList.length == 1) {
	ask(app, "<speak>Available year for City " + city + " is " + YearList + ", please select a year.</speak>");
	}
	if(YearList.length > 1) {
	ask(app, "<speak>Available years for City " + city + " are " + YearList + ", please select a year.</speak>");
	}
	}
    }
else if (app.getIntent() === "SongDetail") {
      if(MusicUrlList.length>=1){
	ask(app, "<speak>You are listening "+MusicUrlList[counter]['title'] + ", "+ MusicUrlList[counter]['coverage']+ ", "+ MusicUrlList[counter]['year']+".</speak>");

      }else{
	ask(app, "<speak>No song id Playing now. Please select collection first.</speak>");
      }
    
    }
  else if ((app.getIntent() === MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
  //else if (app.getIntent() === MEDIA_STATUS_INTENT) {
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
    }
    else {
      console.log('false');
      typeQuery = false;
    }
    console.log('page -' + page);
    console.log('Type -' + typeQuery);

    if (SeventyEights == true) {
      playSeventyEights(app, 0);
    }
    else {
      // .play(app, 0);
      if(OneGoPlayAudioStatus){
        OneGoPlayAudio(app, 0);
      }else{
        play(app, 0);
      }

    }


  }

    else if ((app.getIntent() === "AMAZON.NextIntent")) {
      if(currentSpeechoutput != null) {
	repeatInput(app);
	} else if (SeventyEights == true) {
        if (TotalTrack < 0) {
	ask(app, "<speak>Please Select Topic first</speak>", suggestions);
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
        if (TotalTrack == 0) {
          ask(app, "<speak>Please Select City and year first</speak>", suggestions);
          


        } else {
          counter++;
          if (counter > (TotalTrack - 1) && TotalTrack > 0) {
            page++;
            typeQuery = true;
          } else {
            typeQuery = false;
          }
 	if(OneGoPlayAudioStatus){
            OneGoPlayAudio(app, 0);
          }else{
            play(app, 0);
          }
        }
      }
    }
    else if (app.getIntent() === "AMAZON.PreviousIntent") {
	if(previousSpeechoutput == -1) {
	repeatInput(app);
	} else if(previousSpeechoutput != null) {
	ask(app, previousSpeechoutput, previousSuggestions);
	} else if (SeventyEights == true) {
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
        if(OneGoPlayAudioStatus){
            OneGoPlayAudio(app, 0);
          }else{
            play(app, 0);
          }
      }

    }
    }
  
  }




function getCollection (app) {
  collection = app.getArgument("COLLECTION");
  var collection_real_name = app.getArgument("COLLECTION");
logger("collection : "+collection);
logger("collection_real_name : "+collection);
  if (collection != '' || collection != undefined) {

    collectionQuery = '';
    var collectionArray = collection.split(/[ ,]+/);

    if (collectionArray.length > 1) {
      collectionQuery = collectionQuery + '(';

      for (var i = 1; i < collectionArray.length; i++) {
        collectionQuery = collectionQuery + collectionArray[i];
      }

      collectionQuery = collectionQuery + ')+OR+collection:(';
      for (var i = 0; i < collectionArray.length - 1; i++) {
        collectionQuery = collectionQuery + collectionArray[i];
      }

      collection = collection.replace(/ /g, '');
      collectionQuery = '(' + collectionQuery + ')+OR+collection:(' + collection + ')+OR+collection:(the' + collection + '))';
    } else {
      collection = collection.replace(/ /g, '');
      collectionQuery = '(' + collectionQuery + '(' + collection + ')+OR+collection:(the' + collection + '))';
    }

    var checkCollectionUrl = podcastAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=50&page=0&indent=yes&output=json';
            	checkCollectionUrl = customEncodeUri(checkCollectionUrl); 
      var optionscheckCollectionUrl = {
        host: host,
        path: checkCollectionUrl,
        method: 'GET',
        headers: {
           "User-Agent" : 'Google_Action_Internet_Archive'
        }
      };
    logger(optionscheckCollectionUrl);

    https.get(optionscheckCollectionUrl, function (res) {
      var body = '';
      res.on('data', function (data) {
        body += data;
      });
      CityName = 'Los Angeles';
      YearName = '1971';
      res.on('end', function () {
    logger("Function End");
	var cardTitle = '';
	var repromptText = '';
	var cardOutput = '';
	var speechOutput = '';
	var response = '';
        var resultCollection = parseJsonBody(body);
        logger("resultCollection length : "+resultCollection['response']['docs'].length);
        if (resultCollection != null && resultCollection['response']['docs'].length > 0) {
          //http to node server collection title city =null year=null url=checkCollectionUrl resultCollection =result
          for (var i = 0; i < resultCollection['response']['docs'].length; i++) {
            if (resultCollection['response']['docs'][i]['coverage'] != '' && resultCollection['response']['docs'][i]['coverage'] != undefined && resultCollection['response']['docs'][i]['year'] != '' && resultCollection['response']['docs'][i]['year'] != undefined) {
              if (resultCollection['response']['docs'][i]['coverage'].includes(",")) {
                var resCity = resultCollection['response']['docs'][i]['coverage'].split(",");
                CityName = resCity[0];
                YearName = resultCollection['response']['docs'][i]['year'];
                break;
              }
            }
          }
          cardTitle = 'Provide City and Year';
          repromptText = "<speak>Please select a City and year.<break time='.5s'/> Like " + CityName + " " + YearName + "  or <break time='.1s'/>random.</speak>";
          cardOutput = collection_real_name + " has been selected. Now, please select CITY and YEAR or RANDOM. Like " + CityName + " " + YearName + " or random.";

//          speechOutput = "<speak>" + collection_real_name + " has been selected.<break time='.5s'/> Now Please select City and Year or <break time='.1s'/>random. <break time='.5s'/>Like " + //CityName + " " + YearName + " or <break time='.1s'/> random.</speak>";
	speechOutput = "<speak>" + collection_real_name + " - great choice! Do you have a specific city and year in mind, like " + CityName + " " + YearName + ", or would you like me to play something randomly from "+collection_real_name+"?</speak>";
          log("The Collection " + collection + " has been selected.", collection, null, null, checkCollectionUrl, function (status) {

          });
	suggestions = [CityName + " " + YearName, "Random"];
          ask(app, speechOutput, suggestions);

        } else {
          cardTitle = 'Collection not exists';
          repromptText = "<speak>" + collection_real_name + " has no song.<break time='.5s'/> Please try again by saying<break time='.5s'/> artist name.<break time='.5s'/> Like The Ditty Bops,<break time='.5s'/> or Cowboy Junkies,<break time='.5s'/> or Grateful Dead.</speak>";
          speechOutput = "<speak>Sorry, " + collection_real_name + " has no song. Please try again by saying<break time='.5s'/> artist name.<break time='.5s'/> Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
          cardOutput = "Sorry, " + collection_real_name + " has no song. Please try again by saying ARTIST NAME like The Ditty Bops, Cowboy Junkies Or Grateful Dead.";

          log("Sorry Collection: " + collection + " has no songs.", collection, null, null, checkCollectionUrl, function (status) {

          });
          collection = '';
         ask(app, speechOutput, suggestions);
        }

 

      });
    }).on('error', function (e) {
	var cardTitle = '';
	var repromptText = '';
	var cardOutput = '';
	var speechOutput = '';
	var response = '';
      cardTitle = 'Waiting for your responce.';
      repromptText = "<speak> Unable to understand your request. Please try again by saying artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
      speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by saying artist name. Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> Or Grateful Dead.</speak>";
      cardOutput = "Sorry, unable to understand your request. Please try again by saying ARTIST NAME like The Ditty Bops, Cowboy Junkies, Or Grateful Dead.";
     
      log("Sorry, Unable to understand your request for collection: " + collection + " request ", collection, null, null, checkCollectionUrl, function (status) {
      });
      collection = '';
      ask(app, speechOutput, suggestions);
    });
  } else {
    cardTitle = 'Please provide valid artist';
    repromptText = "<speak>Waiting for your responce.</speak>";
    speechOutput = "<speak>Please provide a artist name.</speak>";
    cardOutput = "Please provide a ARTIST NAME.";
    
    ask(app, speechOutput, suggestions);
  }

}


 function unique() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

var MyAudioPlayer = function (event, context) {
  this.event = event;
  this.context = context;
};



//SeventyEights
 function playSeventyEights(app, offsetInMilliseconds) {
  getAudioPlayListSeventyEights(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
      Obj.context.succeed(response);
    } else {
      Obj.context.succeed(response);
    }
  })
};

function getAudioPlayListSeventyEights(app, counter, thisOBJ, offsetInMilliseconds, callback) {
  var track = counter + 1;
  if ((MusicUrlList.length > 0 && app.getIntent() != 'SeventyEights' && app.getIntent() !='OneGoSeventyEights'  && app.getIntent() != 'PlaByTopic' && typeQuery === false)) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    // logger('test');
    var trackcounter = counter;
    var start = TotalTrack - (MusicUrlList.length - 1);
    var end = TotalTrack;
    var x = Math.floor((Math.random() * end) + start);
    logger('Track - ' + x);
    logger('Start - ' + start);
    logger('End - ' + end);
    trackcounter = x;
    audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
    logger(app.getIntent());
    logger('problem1 : '+audioURL);
    if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
      askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
    } else {
      askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
    }


  }
  else if (app.getIntent() == 'SeventyEights' || app.getIntent() == 'PlaByTopic'  || app.getIntent() =='OneGoSeventyEights' || typeQuery === true) {

    if (app.getIntent() == 'SeventyEights') {
      logger('into Seventy Eights');
      logger(app.getIntent());
      var cardTitle = 'Collection Seventy Eights Has Been Selected.';
      var repromptText = "<speak>Waiting for your responce.<break time='.1s'/> Please select Topics like Jazz <break time='.5s'/> Instrumental or <break time='.5s'/> Dance</speak>";
      var speechOutput = "<speak>Collection Seventy Eights Has Been Selected.<break time='.1s'/> Please select Topics like Jazz, Instrumental, or Dance</speak>";
	suggestions = ["Jazz", "Instrumental", "Dance"];
      ask(app, speechOutput, suggestions);

    }
    else if (app.getIntent() == 'PlaByTopic' || typeQuery === true || app.getIntent() =='OneGoSeventyEights') {
      if (app.getIntent() == 'PlaByTopic' || app.getIntent() =='OneGoSeventyEights') {
        topicName = title = app.getArgument("TOPIC");
      }

      topicName = topicName.replace(" and ", "#");
      topicName = topicName.replace("&", "#");
      topicName = topicName.replace(/ /g, '');
      topicName = topicName.replace("#", " ");
      topicName = topicName.replace(/[^a-zA-Z0-9 ]/g, "");
      //APIURL = SeventyEightsAPIURL + '(' + topicName + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
		APIURL = SeventyEightsAPIURL + '(' + topicName + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      	APIURL = customEncodeUri(APIURL); 
      var options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
           "User-Agent" : 'Google_Action_Internet_Archive'
        }
      };

      logger(options);
      https.get(options, function (res) {
        var body = '';
        res.on('data', function (data) {
          body += data;
        });
        res.on('end', function () {
          var result = parseJsonBody(body);
          if (result != null && result['response']['docs'].length > 0) {
            APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
            	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
              host: host,
              path: APIURLIDENTIFIER,
              method: 'GET',
              headers: {
                  "User-Agent": 'Google_Action_Internet_Archive'
              }
            };

            https.get(optionsIdentifier, function (responce) {
              var bodyIdentifier = '';
              responce.on('data', function (dataIdentifier) {
                bodyIdentifier += dataIdentifier;
              });

              responce.on('end', function () {
                var resultIdentifier = JSON.parse(bodyIdentifier);
                if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                  var trackNumber = 0;
                  var lastsongsize='';
                  for (var i = 0; i < resultIdentifier['result'].length; i++) {
                    if (resultIdentifier['result'][i]['format'] == 'VBR MP3' && lastsongsize!=resultIdentifier['result'][i]['length']) {
                      lastsongsize=resultIdentifier['result'][i]['length'];
                      if (resultIdentifier['result'][i]['title'] == undefined) {

                        trackNumber = trackNumber + 1;
                        MusicUrlList.push({
                          identifier: result['response']['docs'][0]['identifier'],
                          trackName: resultIdentifier['result'][i]['name'],
                          title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                        });
                      } else {
                        trackNumber = trackNumber + 1;
                        resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                        MusicUrlList.push({
                          identifier: result['response']['docs'][0]['identifier'],
                          trackName: resultIdentifier['result'][i]['name'],
                          title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                        });
                      }
                      TotalTrack++;
                    }
                  }
                  // TotalTrack=TotalTrack+MusicUrlList.length-1;
                  // logger('TrackCount -'+TotalTrack);
                  // logger('Array Size -'+MusicUrlList.length);
                  var trackcounter = counter;
                  var start = TotalTrack - (MusicUrlList.length - 1);
                  var end = TotalTrack;
                  var x = Math.floor((Math.random() * end) + start);
                  logger('Track - ' + x);
                  logger('Start - ' + start);
                  logger('End - ' + end);
                  trackcounter = x;
                  audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                  logger('problem2 : '+audioURL);
                  if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                    askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
                  } else {
                    askAudioWithoutCoverageYear(app, MusicUrlList[counter]['identifier'], track, MusicUrlList[counter]['title'], MusicUrlList[counter]['coverage'], MusicUrlList[counter]['year'], audioURL, suggestions);
                  }


                }
                else {
                  var cardTitle = 'No Songs Found';
                  var repromptText = "<speak>No songs found. Please select Topics like Jazz <break time='.5s'/> Instrumental or <break time='.5s'/> Dance.</speak>";
                  var speechOutput = "<speak>Sorry , No songs found. Please select Topics like Jazz, Instrumental or Dance.</speak>";
	suggestions = ["Jazz", "Instrumental", "Dance"];
                  ask(app, speechOutput, suggestions);
                }

              });
            }).on('error', function (e) {
              var cardTitle = 'Unable to understand your request. Please try again.';
              var repromptText = '<speak>Waiting for your responce.</speak>';
              var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again.</speak>";
              ask(app, speechOutput, suggestions);
            });


          } else {
            var cardTitle = 'No Songs Found';
            var repromptText = '<speak>No songs found. Please try again.</speak>';
            var speechOutput = "<speak>Sorry , No songs found. Please try again.</speak>";
            ask(app, speechOutput, suggestions);

          }

        });
      }).on('error', function (e) {
        year = '';
        city = '';
        var cardTitle = 'Unable to understand your request. Please try again.';
        var repromptText = '<speak>Waiting for your responce.</speak>';
        var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again.</speak>";
        ask(app, speechOutput, suggestions);
      });

    }

  }
  else {
    var cardTitle = 'Unable to understand your request.';
    var repromptText = '<speak>Waiting for your responce.</speak>';
    var speechOutput = "<speak>Sorry, Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";

    ask(app, speechOutput, suggestions);

  }

}
//SeventyEights

 function PlayNext(requestType, offsetInMilliseconds) {
  var track = counter + 1;
  var prevTrack = counter;
  if (MusicUrlList.length > 0) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    var trackcounter = counter;
    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
      var start = TotalTrack - (MusicUrlList.length - 1);
      var end = TotalTrack;
      var x = Math.floor((Math.random() * end) + start);
      logger('Track - ' + x);
      logger('Start - ' + start);
      logger('End - ' + end);
      trackcounter = x;
      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
      if (PlayAudioByRandomYear == true) {
        log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
        });
      } else if (PlayAudioByRandomCity == true) {
        log("PAuto Next laying Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
        });
      } else if (PlayAudioByRandom == true) {
        log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
        });
      }

    } else {
      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
      log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
      });
    }
    // logger('Auto Next -'+audioURL);
    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);

  } else {
    logger('Auto Next - Not Found');
    var cardTitle = 'Unable to understand your request.';
    var repromptText = '<speak>Waiting for your responce.Please try again by saying City and Year. or <break time=".1s"/>random.</speak>';
    var speechOutput = "<speak>Sorry , Error Occured.Please try again. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";

    ask(app, speechOutput, suggestions);
  }


};

	function logger(strLog) {
	console.log(util.inspect(strLog, false, null));
	}

	function customEncodeUri(uri) {
	if(uri!=null && uri != '') {
	return replaceall(" ", "+", uri);
	}
	return '';
	}


function getOneGoPlayAudio(app, counter, thisOBJ, offsetInMilliseconds, callback) {
    var track = counter + 1;

    if ((MusicUrlList.length > 0 && app.getIntent() != 'OneGoPlayAudio' && app.getIntent() != 'OneGoCollectionRandomPlayAudio' && typeQuery === false)) {
      if (track > MusicUrlList.length) {
        counter = 0;
        track = counter + 1;
      }
      // logger('test');
      var trackcounter = counter;
      if (OneGoCollectionRandomPlayAudioStatus === true) {
        // var start = TotalTrack - (MusicUrlList.length - 1);
        // var end = TotalTrack;
        // var x = Math.floor((Math.random() * end) + start);
        // logger('Track - ' + x);
        // logger('Start - ' + start);
        // logger('End - ' + end);
        // trackcounter = x;
        var x= trackcounter;
        audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
        if (OneGoCollectionRandomPlayAudioStatus == true) {
          log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {});
        }

      }else {
        audioURL = 'https://archive.org/download/' + MusicUrlList[trackcounter]['identifier'] + '/' + MusicUrlList[trackcounter]['trackName'];
        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {});
      }
      // logger(app.getIntent());
      if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
            askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      }
      else {
            askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      }


    }
    else if (app.getIntent() == 'OneGoPlayAudio'  || typeQuery === true || app.getIntent() == 'OneGoCollectionRandomPlayAudio') {

      if (app.getIntent() == 'OneGoPlayAudio' || app.getIntent() == 'OneGoCollectionRandomPlayAudio') {
          if (OneGoCollectionRandomPlayAudioStatus == false) {
            city = app.getArgument("CITY");
            year = app.getArgument("YEAR");
          }
          collection = app.getArgument("COLLECTION");
          var collection_real_name = app.getArgument("COLLECTION");
          if (collection != null && collection != '' && collection != undefined) {
        
            collectionQuery = '';
            var collectionArray = collection.split(/[ ,]+/);
        
            if (collectionArray.length > 1) {
              collectionQuery = collectionQuery + '(';
        
              for (var i = 1; i < collectionArray.length; i++) {
                collectionQuery = collectionQuery + collectionArray[i];
              }
        
              collectionQuery = collectionQuery + ')+OR+collection:(';
              for (var i = 0; i < collectionArray.length - 1; i++) {
                collectionQuery = collectionQuery + collectionArray[i];
              }
        
              collection = collection.replace(/ /g, '');
              collectionQuery = '(' + collectionQuery + ')+OR+collection:(' + collection + ')+OR+collection:(the' + collection + '))';
            }
            else {
              collection = collection.replace(/ /g, '');
              collectionQuery = '(' + collectionQuery + '(' + collection + ')+OR+collection:(the' + collection + '))';
            }
            
            if (OneGoCollectionRandomPlayAudioStatus == true) {
              
              APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
            }else{
              APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
            }
        
         
      }else {
        if (used) {
          year = '';
          city = '';
          used = false;
        }
        if (OneGoCollectionRandomPlayAudioStatus == true) {
          
          APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
        }else{
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
        }
      }
	APIURL = customEncodeUri(APIURL); 
      var options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
           "User-Agent" : 'Google_Action_Internet_Archive'
        }
      };
      logger(options);
      https.get(options, function (res) {
        var body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end', function () {

	logger("body : "+body);
          var result = parseJsonBody(body);
          if (result != null && result['response']['docs'].length > 0) {
           if ((app.getIntent() == 'OneGoPlayAudio') || (app.getIntent() == 'OneGoCollectionRandomPlayAudio') || (((city != '' && year != '') || OneGoCollectionRandomPlayAudioStatus==true)  && collectionQuery != '')) {

              if (app.getIntent() == 'OneGoPlayAudio' || app.getIntent() == 'OneGoCollectionRandomPlayAudio' || page == 0) {
                counter = 0;
                MusicUrlList = [];
              }
              if (result['response']['numFound'] < IdentifierCount) {
                used = true;
              }
              else {
                IdentifierCount++;
              }
              //New Https Request for mp3 tracks
              //track=counter+1;
              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
                           	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                    "User-Agent": 'Google_Action_Internet_Archive'
                }
              };

              logger(optionsIdentifier);
              https.get(optionsIdentifier, function (responce) {
                var bodyIdentifier = '';
                responce.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                responce.on('end', function () {
                  var resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                    var trackNumber = 0;
                    for (var i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] == 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] == undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        else {
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    logger('TotalTrack' + TotalTrack);
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    var trackcounter = counter;
                    if (OneGoCollectionRandomPlayAudioStatus === true) {
                      // var start = TotalTrack - (MusicUrlList.length - 1);
                      // var end = TotalTrack;
                      // var x = Math.floor((Math.random() * end) + start);
                      // logger('Track - ' + x);
                      // logger('Start - ' + start);
                      // logger('End - ' + end);
                      // trackcounter = x;
                      var x=trackcounter;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (OneGoCollectionRandomPlayAudioStatus == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {});
                      }

                    }else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {});
                    }

                    if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                          askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }
                    else {
                          askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }




                  }
                  else {
                    var cardTitle = 'No Songs Found';
                    var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
                    var speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
                    var cardOutput = "Sorry, No songs found. Please try again by saying City and Year or Random";
                    ask(app, speechOutput, suggestions);
                  }

                });
              }).on('error', function (e) {
                var cardTitle = 'Unable to understand your request. ';
                var repromptText = '<speak>Waiting for your responce.Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
                var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
                var cardOutput = "Sorry, Unable to understand your request. Please try again by saying City and Year or Random.";
                ask(app, speechOutput, suggestions);
              });

            }
          }
          else {

            if (PlayAudioByRandom) {
              log("Sorry , No result found for command play " + collection + " random  ", collection, 'random', 'random', APIURL, function (status) {});

            }
            else {
              log("Sorry , No result found for command play " + collection + " " + city + " " + year + "   ", collection, city, year, APIURL, function (status) {});
            }
            year = '';
            city = '';
            var cardTitle = 'No Songs Found';
            var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
            var speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/>  random.</speak>";
            var cardOutput = "Sorry, No songs found. Please try again by saying City and Year or random.";
            ask(app, speechOutput, suggestions);

          }

        });
      }).on('error', function (e) {
        year = '';
        city = '';
        var cardTitle = 'Unable to understand your request.';
        var repromptText = '<speak>Waiting for your responce. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
        var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
        var cardOutput = "Sorry, Unable to understand your request. Please try again by saying City and Year or Random.";
        ask(app, speechOutput, suggestions);
      });
      }else {
        var cardTitle = 'Unable to understand your request.';
        var repromptText = '<speak>Waiting for your responce. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
        var speechOutput = "<speak>Sorry, Unable to understand your request. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
        var cardOutput = "Sorry, Unable to understand your request. Please try again by saying City and Year or Random.";
  
        ask(app, speechOutput, suggestions);
  
      }
    }
  
}


function parseJsonBody(body) {
logger(body);
return JSON.parse(body);
}

 function Welcome(app) {

  init(app);
//askAudio(app, "Test Song", "https://ia802307.us.archive.org/20/items/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Booklet/center_vbr.mp3", suggestions);

  var cardTitle = 'Welcome';
  var repromptText = "<speak>Waiting for your responce.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies.</speak>";
  var cardOutput = "Welcome to the live music collection at the Internet Archive. What artist would you like to listen to? For example The Ditty Bops, The Grateful Dead or The Cowboy Junkies.";
  var speechOutput = "<speak><audio src='https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3' />  Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies.  </speak>";
  // var speechOutput = "<speak>Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";

if (app.getLastSeen() != null) {
     speechOutput = "<speak>Welcome back, choose an artist.<break time='.5s'/> For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";
  }

 
  ask(app, speechOutput, suggestions);
}


function getAudioPlayList(app, counter, thisOBJ, offsetInMilliseconds, callback) {
  if (collection != '' || searchBYTitle) {
    var track = counter + 1;

    if ((MusicUrlList.length > 0 && app.getIntent() != 'PlayAudio' && app.getIntent() != 'PlayAudioByRandom' && app.getIntent() != 'PlayAudioByCity' && app.getIntent() != 'PlayAudioByRandomYear' && app.getIntent() != 'PlayAudioByRandomCity' && app.getIntent() != 'PlayAudioQuery' && typeQuery === false)) {
      if (track > MusicUrlList.length) {
        counter = 0;
        track = counter + 1;
      }
      // logger('test');
      var trackcounter = counter;
      if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
        var start = TotalTrack - (MusicUrlList.length - 1);
        var end = TotalTrack;
        var x = Math.floor((Math.random() * end) + start);
        logger('Track - ' + x);
        logger('Start - ' + start);
        logger('End - ' + end);
        trackcounter = x;
        audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
        if (PlayAudioByRandomYear == true) {
          log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
          });
        } else if (PlayAudioByRandomCity == true) {
          log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
          });
        } else if (PlayAudioByRandom == true) {
          log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
          });
        }

      } else {
        audioURL = 'https://archive.org/download/' + MusicUrlList[trackcounter]['identifier'] + '/' + MusicUrlList[trackcounter]['trackName'];
        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
        });
      }
      // logger(app.getIntent());
      if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
logger("autoNext");
         askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      } else {
logger("!autoNext");
        askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
      }


    } else if (app.getIntent() == 'PlayAudio' || app.getIntent() == 'PlayAudioByCity' || app.getIntent() == 'PlayAudioByRandom' || app.getIntent() == 'PlayAudioByRandomYear' || app.getIntent() == 'PlayAudioByRandomCity' || app.getIntent() == 'PlayAudioByYearCity' || app.getIntent() == 'PlayAudioQuery' || typeQuery === true) {

      if (searchBYTitle || app.getIntent() == 'PlayAudioQuery') {
        if (app.getIntent() === 'PlayAudioQuery') {
          title = app.getArgument("TITLE");
        }
        APIURL = podcastAPIURLNEW + title + '%20AND(mediatype:audio)&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandomYear || app.getIntent() == 'PlayAudioByRandomYear') {
        if (app.getIntent() === 'PlayAudioByRandomYear') {
          city = app.getArgument("CITY");
        }
        APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage:(' + city + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandom || app.getIntent() == 'PlayAudioByRandom') {
        APIURL = podcastCityAPIURL + collectionQuery + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else if (PlayAudioByRandomCity || app.getIntent() == 'PlayAudioByRandomCity') {
        if (app.getIntent() === 'PlayAudioByRandomCity') {
          year = app.getArgument("YEAR");
        }
        APIURL = podcastAPIURL + collectionQuery + '+AND+year:(' + year + ')&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=1&page=' + page + '&indent=yes&output=json';
      } else {
        if (used) {
          year = '';
          city = '';
          used = false;
        }

        if (app.getIntent() === 'PlayAudioByYearCity') {
          year = app.getArgument("YEAR");
          city = app.getArgument("CITY");

        } else if (app.getIntent() === 'PlayAudio') {
          year = app.getArgument("YEAR");
          APIURL = podcastAPIURL + collectionQuery + '+AND+year:(' + year + ')';

        } else if (app.getIntent() === 'PlayAudioByCity') {
          city = app.getArgument("CITY");
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')';
        }

        if (year != '' && city != '') {
          APIURL = podcastCityAPIURL + collectionQuery + '+AND+coverage%3A(' + city + ')+AND+year%3A(' + year + ')';
        }
        if (app.getIntent() === 'PlayAudioByCity') {
          APIURL = APIURL + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=random&rows=50&page=' + page + '&indent=yes&output=json';
        }else{
          APIURL = APIURL + '&fl[]=coverage&fl[]=creator&fl[]=description&fl[]=downloads&fl[]=identifier&fl[]=mediatype&fl[]=subject,year,location&fl[]=title&sort[]=downloads+desc&rows=1&page=' + page + '&indent=yes&output=json';
        }
      }
      	APIURL = customEncodeUri(APIURL); 
      var options = {
        host: host,
        path: APIURL,
        method: 'GET',
        headers: {
           "User-Agent" : 'Google_Action_Internet_Archive'
        }
      };
      logger(options);
      https.get(options, function (res) {
        var body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end', function () {
          var result = parseJsonBody(body);
          if (result != null && result['response']['docs'].length > 0) {
            if ((app.getIntent() === 'PlayAudioByCity' || app.getIntent() == 'PlayAudio') && (year == '' || city == '')) {
              var YearString = '';
              var CityList = [];
              var CityString = '';
              if (app.getIntent() === 'PlayAudioByCity' && year == '') {
                for (var i = 0; i < result['response']['docs'].length; i++) {
                  YearList.push(result['response']['docs'][i]['year']);
                }
                YearList = YearList.unique();
                YearList = YearList.sort();
		
                //for (var i = 0; i < YearList.length; i++) {
               //   YearString = YearString + YearList[i] + ', ';
               // }

                var cardTitle = 'Please select a year.';
                var repromptText = '<speak> Waiting for your responce.</speak>';
                var speechOutput = "<speak> Year list for City " + city + " is not available. Please Select random.</speak>";

		if(YearList.length == 1) {
		YearString = YearList[0];
                speechOutput = "<speak> Ok... available year for City " + city + " is " + YearString + ", please select a year.</speak>";
		}
		else if(YearList.length > 1) {
		YearString = YearList[0]+" to "+YearList[YearList.length-1];
                speechOutput = "<speak> Ok... available years for City " + city + " are " + YearString + ", please select a year.</speak>";
		}


                log("Ok, available years for artist: " + collection + " and City: " + city + " are " + YearString, collection, city, year, APIURL, function (status) {
                });
	suggestions = YearList;
                ask(app, speechOutput, suggestions);

              } else if (app.getIntent() === 'PlayAudio' && city == '') {
                for (var i = 0; i < result['response']['docs'].length; i++) {
                  CityList.push(result['response']['docs'][i]['coverage']);
                }

                CityList = CityList.unique();
                CityList = CityList.sort();
                for (var i = 0; i < CityList.length; i++) {
                  CityString = CityString + CityList[i] + ', ';
                }

                var cardTitle = 'Please Select City.';
                var repromptText = '<speak> Waiting for your responce.</speak>';
                var speechOutput = "<speak>Ok , available cities for year " + year + " are " + CityString + ' Please Select city.</speak> ';
                log("Ok , available cities for artist: " + collection + " and year: " + year + " are " + CityString, collection, city, year, APIURL, function (status) {
                });
	suggestions = CityList;
	      ask(app, speechOutput, suggestions);
	
	      }

            }
            else if ((app.getIntent() == 'PlayAudioByYearCity') || (city != '' && year != '')) {

              if (app.getIntent() == 'PlayAudioByYearCity' || page == 0) {
                counter = 0;
                MusicUrlList = [];
              }
              if (result['response']['numFound'] < IdentifierCount) {
                used = true;
              } else {
                IdentifierCount++;
              }
              //New Https Request for mp3 tracks
              //track=counter+1;
              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
                            	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                    "User-Agent": 'Google_Action_Internet_Archive'
                }
              };

              logger(optionsIdentifier);
              https.get(optionsIdentifier, function (responce) {
                var bodyIdentifier = '';
                responce.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                responce.on('end', function () {
                  var resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                    var trackNumber = 0;
                    for (var i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] == 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] == undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        } else {
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    logger('TotalTrack' + TotalTrack);
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    var trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      var start = TotalTrack - (MusicUrlList.length - 1);
                      var end = TotalTrack;
                      var x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }

                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }
                    
                    if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
logger(MEDIA_STATUS_INTENT);
                       askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }else{
logger('audio url : '+audioURL);
                        askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }

                   
                   
                   
                  } else {
                    var cardTitle = 'No Songs Found';
                    var repromptText = '<speak> No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
                    var speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
                    ask(app, speechOutput, suggestions);
                  }

                });
              }).on('error', function (e) {
                var cardTitle = 'Unable to understand your request. ';
                var repromptText = '<speak>Waiting for your responce.Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
                var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
                ask(app, speechOutput, suggestions);
              });

            }
            else if (app.getIntent() == 'PlayAudioQuery' || searchBYTitle) {
              if (app.getIntent() === 'PlayAudioQuery') {

                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              for (var i = 0; i < result['response']['docs'].length; i++) {
                MusicUrlList.push({
                  identifier: result['response']['docs'][i]['identifier'],
                  trackName: MusicUrlList[counter]['identifier'] + '_vbr.m3u',
                  title: result['response']['docs'][i]['title'],
                          coverage: (result['response']['docs'][i]['coverage'])?result['response']['docs'][i]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][i]['year'])?result['response']['docs'][i]['year']:'Year Not mentioned',
                });
              }

              log("Result for search " + title, collection, null, null, APIURL, function (status) {
              });
              var trackcounter = counter;
              if (PlayAudioByRandomYear == true || PlayAudioByRandomCity == true || PlayAudioByRandom == true) {
                var start = page * 50;
                var end = (page * 50) + MusicUrlList.length - 1;
                var x = Math.floor((Math.random() * end) + start);
                logger('Track - ' + x);
                logger('Start - ' + start);
                logger('End - ' + end);
                trackcounter = x;
                audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                if (PlayAudioByRandomYear == true) {
                  log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                  });
                } else if (PlayAudioByRandomCity == true) {
                  log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                  });
                } else if (PlayAudioByRandom == true) {
                  log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                  });
                }

              } else {
                audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                });
              }
              
               if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                 askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
               }else{
                 askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                 
               }
              
            }
            else if (app.getIntent() == 'PlayAudioByRandomYear' || PlayAudioByRandomYear) {
              if (app.getIntent() === 'PlayAudioByRandomYear') {
                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
                            	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                    "User-Agent": 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (responce) {
                var bodyIdentifier = '';
                responce.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                responce.on('end', function () {
                  var resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                    var trackNumber = 0;
                    for (var i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] == 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] == undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    //   TotalTrack=TotalTrack+MusicUrlList.length-1;

                    var trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      var start = TotalTrack - (MusicUrlList.length - 1);
                      var end = TotalTrack;
                      var x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }

                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }
                    
                    if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                      
                    }else{
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                    }

                    

                  }
                  else {
                    var cardTitle = 'No Songs Found';
                    var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
                    var speechOutput = "<speak>Priyank Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
                    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                  }

                });
              }).on('error', function (e) {
                var cardTitle = 'Unable to understand your request.';
                var repromptText = '<speak>Waiting for your responce. Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
                var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
                ask(app, speechOutput, suggestions);
              });

            }
            else if (app.getIntent() == 'PlayAudioByRandomCity' || PlayAudioByRandomYear) {
              if (app.getIntent() === 'PlayAudioByRandomCity') {

                counter = 0;
                MusicUrlList = [];
                track = counter + 1;

              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
                            	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                    "User-Agent": 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (responce) {
                var bodyIdentifier = '';
                responce.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                responce.on('end', function () {
                  var resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                    var trackNumber = 0;
                    for (var i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] == 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] == undefined) {
                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;

                    var trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      var start = TotalTrack - (MusicUrlList.length - 1);
                      var end = TotalTrack;
                      var x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }

                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }
                    
                     if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                        askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                     }else{
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                     }
                  }
                  else {
                    var cardTitle = 'No Songs Found';
                    var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
                    var speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
                    ask(app, speechOutput, suggestions);
                  }

                });
              }).on('error', function (e) {
                var cardTitle = 'Unable to understand your request.';
                var repromptText = '<speak>Waiting for your responce. Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
                var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
                ask(app, speechOutput, suggestions);
              });
            }
            else if (app.getIntent() == 'PlayAudioByRandom' || PlayAudioByRandom) {
              if (app.getIntent() === 'PlayAudioByRandom') {

                counter = 0;
                MusicUrlList = [];
                track = counter + 1;
              }

              APIURLIDENTIFIER = APIURLIdentifier + result['response']['docs'][0]['identifier'] + '/files';
                            	APIURLIDENTIFIER = customEncodeUri(APIURLIDENTIFIER); 
      var optionsIdentifier = {
                host: host,
                path: APIURLIDENTIFIER,
                method: 'GET',
                headers: {
                    "User-Agent": 'Google_Action_Internet_Archive'
                }
              };

              https.get(optionsIdentifier, function (responce) {
                var bodyIdentifier = '';
                responce.on('data', function (dataIdentifier) {
                  bodyIdentifier += dataIdentifier;
                });

                responce.on('end', function () {
                  var resultIdentifier = JSON.parse(bodyIdentifier);
                  if (resultIdentifier != null && resultIdentifier['result'].length > 0) {
                    var trackNumber = 0;
                    for (var i = 0; i < resultIdentifier['result'].length; i++) {
                      if (resultIdentifier['result'][i]['format'] == 'VBR MP3') {
                        if (resultIdentifier['result'][i]['title'] == undefined) {

                          trackNumber = trackNumber + 1;
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: 'Track Number ' + trackNumber,
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        } else {
                          trackNumber = trackNumber + 1;
                          resultIdentifier['result'][i]['title'] = resultIdentifier['result'][i]['title'].replace(/[^a-zA-Z0-9 ]/g, "");
                          MusicUrlList.push({
                            identifier: result['response']['docs'][0]['identifier'],
                            trackName: resultIdentifier['result'][i]['name'],
                            title: resultIdentifier['result'][i]['title'],
                          coverage: (result['response']['docs'][0]['coverage'])?result['response']['docs'][0]['coverage']:'Coverage Not mentioned',
                          year: (result['response']['docs'][0]['year'])?result['response']['docs'][0]['year']:'Year Not mentioned',
                          });
                        }
                        TotalTrack++;
                      }
                    }
                    // TotalTrack=TotalTrack+MusicUrlList.length-1;
                    // logger('TrackCount -'+TotalTrack);
                    // logger('Array Size -'+MusicUrlList.length);
                    var trackcounter = counter;
                    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
                      var start = TotalTrack - (MusicUrlList.length - 1);
                      var end = TotalTrack;
                      var x = Math.floor((Math.random() * end) + start);
                      logger('Track - ' + x);
                      logger('Start - ' + start);
                      logger('End - ' + end);
                      trackcounter = x;
                      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
                      if (PlayAudioByRandomYear == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandomCity == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
                        });
                      } else if (PlayAudioByRandom == true) {
                        log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
                        });
                      }

                    } else {
                      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
                      log("Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
                      });
                    }
                    
                     if ((app.getIntent() == MEDIA_STATUS_INTENT) && (app.getArgument("MEDIA_STATUS").extension.status == app.Media.Status.FINISHED)) {
                       
                       askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
                     }else{
                      askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);
}
                    

                  }
                  else {
                    var cardTitle = 'No Songs Found';
                    var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
                    var speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";
                   
                      ask(app, speechOutput, suggestions);
                  }

                });
              }).on('error', function (e) {
                var cardTitle = 'Unable to understand your request.';
                var repromptText = '<speak>Waiting for your responce. Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
                var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
                ask(app, speechOutput, suggestions);
              });
            }


          } else {

            if (PlayAudioByRandom) {
              log("Sorry , No result found for command play " + collection + " random  ", collection, 'random', 'random', APIURL, function (status) {
              });

            } else {
              log("Sorry , No result found for command play " + collection + " " + city + " " + year + "   ", collection, city, year, APIURL, function (status) {
              });
            }
            
            var cardTitle = 'No Songs Found';
            var repromptText = '<speak>No songs found. Please try again by saying City and Year. or <break time=".1s"/> random.</speak>';
            var speechOutput = checkYear(year);
		if(speechOutput == '') {
		speechOutput = "<speak>Sorry , No songs found. Please try again by saying City and Year. or <break time='.1s'/>  random.</speak>";
		}
	    //year = '';
            //city = '';
            ask(app, speechOutput, suggestions);

          }

        });
      }).on('error', function (e) {
        year = '';
        city = '';
        var cardTitle = 'Unable to understand your request.';
        var repromptText = '<speak>Waiting for your responce. Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
        var speechOutput = "<speak>Sorry , Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";
        ask(app, speechOutput, suggestions);
      });
    } else {
      var cardTitle = 'Unable to understand your request.';
      var repromptText = '<speak>Waiting for your responce. Please try again by select. City and Year. or <break time=".1s"/> random.</speak>';
      var speechOutput = "<speak>Sorry, Unable to understand your request. Please try again by select. City and Year. or <break time='.1s'/> random.</speak>";

      ask(app, speechOutput, suggestions);

    }
  } else {
    var cardTitle = 'Please select artist';
    var repromptText = "<speak>Please select an artist by saying<break time='.5s'/> artist name.<break time='.5s'/> Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> or Grateful Dead.</speak>";
    var speechOutput = "<speak>Please select an artist by saying<break time='.5s'/> artist name.<break time='.5s'/> Like The Ditty Bops,<break time='.5s'/> Or Cowboy Junkies,<break time='.5s'/> or Grateful Dead.</speak>";

    ask(app, speechOutput, suggestions);
  }
}

	function checkYear(year) {
		var speechOutput = '';
		if(YearList.length>0 && YearList.indexOf(year) < 0){
		var tempYearList = [];
		tempYearList.push(YearList);
		tempYearList.push(year);
		tempYearList = tempYearList.unique();
		tempYearList = tempYearList.sort();
		var yearIndex = tempYearList.indexOf(year);
		//speechOutput = tempYearList;
logger("yearIndex : "+yearIndex);
logger("tempYearList : "+tempYearList);
		if(yearIndex>0 && yearIndex<tempYearList.length-1) {
		speechOutput = "<speak> I don’t have anything for "+year+". The two closest years for City " + city + ". I would have are in "+tempYearList[yearIndex-1]+" or "+tempYearList[yearIndex+1]+". Which year would you like? </speak>";
		}
		else if(yearIndex==0 || yearIndex == tempYearList.length-1) {
		speechOutput = "<speak> I don’t have anything for "+year+". Please select within suggested range. </speak>";
		var YearString = '';
		if(YearList.length == 1) {
		YearString = YearList[0];
                speechOutput = "<speak> I don’t have anything for "+year+". Available year for City " + city + " is " + YearString + ".</speak>";
		}
		else if(YearList.length > 1) {
		YearString = YearList[0]+" to "+YearList[YearList.length-1];
                speechOutput = "<speak> I don’t have anything for "+year+". Available years for City " + city + " are " + YearString + ".</speak>";
		}
		}
	}
	return speechOutput;
	}


 function handleSessionEndRequest() {
  var cardTitle = 'Good bye';
  var speechOutput = "<speak>Thanks for rocking with the internet archive’s live music collection!</speak>";
  var repromptText = "<speak>Thanks for rocking with the internet archive’s live music collection!</speak>";
  ask(app, speechOutput, suggestions);
}

function log(Title, Collection, City, Year, Url, callback) {
  var url = "http://alexa.appunison.in:5557/admin/savelog?identifierName=" + Collection + "&title=" + Title + "&city=" + City + "&year=" + Year + "&url=" + Url + "&resltJson=null";
  logger(url);
}

function log1(Title, Collection, City, Year, Url, callback) {
  var url = "http://alexa.appunison.in:5557/admin/savelog?identifierName=" + Collection + "&title=" + Title + "&city=" + City + "&year=" + Year + "&url=" + Url + "&resltJson=null";
  logger(url);
  http.get(url, function (res) {
    var body = '';
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      callback(true);

    });
  }).on('error', function (e) {
    callback(true);
  });
}



  function Discovery(app) {

  var cardTitle = 'Discover more';
  var repromptText = "<speak>Waiting for your responce.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/> Like , Disco Biscuits, Hot Buttered Rum, or Keller Williams.</speak>";
  // var speechOutput = "<speak>Welcome To The Internet Archive,<break time='1s'/> Please select a collection by saying<break time='.5s'/> play Collection name.<break time='.5s'/> like Play The Ditty Bops,<break time='.5s'/> Or Play Cowboy Junkies.<break time='.5s'/> Or Play Grateful Dead.</speak>";
  var cardOutput = "We have more collection like Disco Biscuits, Hot Buttered Rum or Keller Williams.";
  var speechOutput = "<speak>We have more collection.<break time='.5s'/> Like , Disco Biscuits, Hot Buttered Rum, or Keller Williams.</speak>";
	suggestions = ["Disco Biscuits", "Hot Buttered Rum", "Keller Williams"];
  ask(app, speechOutput, suggestions);
}

  function OneGoPlayAudio(app, offsetInMilliseconds) {
  getOneGoPlayAudio(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
      Obj.context.succeed(response);
    }
    else {
      Obj.context.succeed(response);
    }
  })
};

 function play(app, offsetInMilliseconds) {
  getAudioPlayList(app, counter, this, offsetInMilliseconds, function (err, Obj, response) {
    if (!err) {
	logger("!Error : "+response);
    } else {
      logger("Error : "+response);
    }
  })
};



function tell(app, speechOutput) {
app.tell(app.buildRichResponse()
    .addSimpleResponse(speechOutput));
}

function ask(app, speechOutput, suggestions) {
if(speechOutput != currentSpeechoutput) {
previousSpeechoutput = currentSpeechoutput;
previousSuggestions = currentSuggestions;
currentSpeechoutput = speechOutput;
currentSuggestions = suggestions;
}
app.ask(app.buildRichResponse()
    .addSimpleResponse(speechOutput)
	.addSuggestions(suggestions));
}

function askAudioWithoutCoverageYear(app, identifier, track, title, coverage, year, audioURL, suggestions) {

logger("Current Song Without Coverage : "+counter+"/"+MusicUrlList.length);
previousSpeechoutput = currentSpeechoutput;
previousSuggestions = currentSuggestions;
currentSpeechoutput = null;
currentSuggestions = null;

logger("audioURL : "+audioURL);

app.ask(app.buildRichResponse()
    .addSimpleResponse("Playing track - "+title)
	.addMediaResponse(app.buildMediaResponse()
      	.addMediaObjects([app.buildMediaObject("Playing track number - "+track, audioURL)
          .setDescription("Playing track - "+title)
          //.setImage(imageURL+replaceall(" ", "", collection), app.Media.ImageType.LARGE)
	.setImage(imageURL+identifier, app.Media.ImageType.LARGE)
          //.setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/1200px-Internet_Archive_logo_and_wordmark.svg.png", app.Media.ImageType.SMALL)
      ])
    ).addSuggestions(suggestions));
}


function askAudio(app, identifier, track, title, coverage, year, audioURL, suggestions) {
logger("Current Song With Coverage : "+counter+"/"+MusicUrlList.length);
previousSpeechoutput = currentSpeechoutput;
previousSuggestions = currentSuggestions;
currentSpeechoutput = null;
currentSuggestions = null;

logger("audioURL : "+audioURL);

app.ask(app.buildRichResponse()
    .addSimpleResponse("Playing track - "+title+", "+coverage+", "+year)
	.addMediaResponse(app.buildMediaResponse()
      	.addMediaObjects([app.buildMediaObject("Playing track number - "+track, audioURL)
          .setDescription("Playing track - "+title+", "+coverage+", "+year)
	.setImage(imageURL+identifier, app.Media.ImageType.LARGE)
        //  .setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/1200px-Internet_Archive_logo_and_wordmark.svg.png", app.Media.ImageType.SMALL)
      ])
    ).addSuggestions(suggestions));
}


function PlayNextSong(requestType, offsetInMilliseconds) {
  var track = counter + 1;
  var prevTrack = counter;
  if (MusicUrlList.length > 0) {
    if (track > MusicUrlList.length) {
      counter = 0;
      track = counter + 1;
    }
    var trackcounter = counter;
    if (PlayAudioByRandomYear === true || PlayAudioByRandomCity === true || PlayAudioByRandom === true) {
      var start = TotalTrack - (MusicUrlList.length - 1);
      var end = TotalTrack;
      var x = Math.floor((Math.random() * end) + start);
      logger('Track - ' + x);
      logger('Start - ' + start);
      logger('End - ' + end);
      trackcounter = x;
      audioURL = 'https://archive.org/download/' + MusicUrlList[x]['identifier'] + '/' + MusicUrlList[x]['trackName'];
      if (PlayAudioByRandomYear == true) {
        log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, 'random', APIURL, function (status) {
        });
      } else if (PlayAudioByRandomCity == true) {
        log("PAuto Next laying Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', year, APIURL, function (status) {
        });
      } else if (PlayAudioByRandom == true) {
        log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, 'random', 'random', APIURL, function (status) {
        });
      }

    } else {
      audioURL = 'https://archive.org/download/' + MusicUrlList[counter]['identifier'] + '/' + MusicUrlList[counter]['trackName'];
      log("Auto Next Playing Track URL - " + audioURL + " And Track Name - " + MusicUrlList[trackcounter]['title'], collection, city, year, APIURL, function (status) {
      });
    }
    // logger('Auto Next -'+audioURL);
    askAudio(app, MusicUrlList[trackcounter]['identifier'], track, MusicUrlList[trackcounter]['title'], MusicUrlList[trackcounter]['coverage'], MusicUrlList[trackcounter]['year'], audioURL, suggestions);

  } else {
    logger('Auto Next - Not Found');
    var cardTitle = 'Unable to understand your request.';
    var repromptText = '<speak>Waiting for your responce.Please try again by saying City and Year. or <break time=".1s"/>  random.</speak>';
    var speechOutput = "<speak>Sorry , Error Occured.Please try again. Please try again by saying City and Year. or <break time='.1s'/> random.</speak>";

    ask(app, speechOutput, suggestions);
  }


};

