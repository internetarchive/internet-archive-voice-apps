const _ = require('lodash');
const sinon = require('sinon');

const basicHeaderRequest = {
  'content-type': 'application/json; charset=UTF-8',
  'Google-Actions-API-Version': 2,
};

function getBody ({ action, data = {}, userStorage = {}, lastSeen = '2018-02-15T15:54:15Z' }) {
  return {
    id: '70c039ef-32e8-4a44-875c-81788cf5e1da',
    timestamp: '2018-02-15T15:55:15.889Z',
    lang: 'en-us',

    originalDetectIntentRequest: {
      payload: {
        user: {
          userStorage: JSON.stringify({ data: userStorage }),
          lastSeen: lastSeen,
          locale: 'en-US',
          userId: 'ABwppHF87C7vRsEg2MsfxhYPar0beTkSw3KHiQEWc5OznoqwWNjh2Tko0Pp30Oow2Qak6BtTYs25J6HlSR03oQT70OVv',
          storage: {},
        },

        conversation: {
          type: 'NEW',
        },
      },
    },

    queryResult: {
      action,

      intent: {
        displayName: action,
      },

      outputContexts: [{
        name: '_actions_on_google',
        parameters: {
          data: JSON.stringify(data),
        },
      }],

      parameters: {},
    },
    status: { 'code': 200, 'errorType': 'success', 'webhookTimedOut': false },
    sessionId: '1518710115665'
  };
}

class MockRequest {
  constructor (body = {}, headers = basicHeaderRequest) {
    this.headers = headers;
    this.body = body;
  }

  get (header) {
    return this.headers[header];
  }
}

class MockResponse {
  constructor () {
    this.statusCode = undefined;
    this.headers = {};
  }

  status (statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  send (body) {
    this.body = body;
    return this;
  }

  append (header, value) {
    this.headers[header] = value;
    return this;
  }

  data () {
    return this.body.contextOut[0].parameters;
  }

  userResponse () {
    return this.body.payload.google.expectUserResponse;
  }

  setHeader () {
    return sinon.spy();
  }

  suggestions () {
    return this.body.payload.google.richResponse.suggestions.map(i => i.title);
  }

  /**
   * just get plain speech text for matching with expectation
   */
  speech () {
    return this.body.speech || _.get(this, 'body.payload.google.richResponse.items', []).map(i => i.speech || i.simpleResponse.textToSpeech).join('\n');
  }
}

module.exports = {
  buildIntentRequest: (opts) => new MockRequest(getBody(opts)),
  MockRequest,
  MockResponse,
};
