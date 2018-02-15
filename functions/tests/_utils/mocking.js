const basicHeaderRequest = {
  'content-type': 'application/json; charset=UTF-8',
};

function getBody ({action, lastSeen = '2018-02-15T15:54:15Z'}) {
  return {
    'originalRequest': {
      'source': 'google',
      'version': '2',
      'data': {
        'isInSandbox': true,
        'surface': {
          'capabilities': [{
            'name': 'actions.capability.AUDIO_OUTPUT'
          }, {
            'name': 'actions.capability.SCREEN_OUTPUT'
          }, {
            'name': 'actions.capability.MEDIA_RESPONSE_AUDIO'
          }, {
            'name': 'actions.capability.WEB_BROWSER'
          }]
        },
        'inputs': [{
          'rawInputs': [{'query': 'Talk to my test app', 'inputType': 'VOICE'}],
          'intent': 'actions.intent.MAIN'
        }],
        'user': {
          'userStorage': '{"data":{}}',
          'lastSeen': lastSeen,
          'locale': 'en-US',
          'userId': 'ABwppHF87C7vRsEg2MsfxhYPar0beTkSw3KHiQEWc5OznoqwWNjh2Tko0Pp30Oow2Qak6BtTYs25J6HlSR03oQT70OVv'
        },
        'conversation': {'conversationId': '1518710115665', 'type': 'NEW'},
        'availableSurfaces': [{'capabilities': [{'name': 'actions.capability.SCREEN_OUTPUT'}, {'name': 'actions.capability.AUDIO_OUTPUT'}]}]
      }
    },
    'id': '70c039ef-32e8-4a44-875c-81788cf5e1da',
    'timestamp': '2018-02-15T15:55:15.889Z',
    'lang': 'en-us',
    'result': {
      'source': 'agent',
      'resolvedQuery': 'GOOGLE_ASSISTANT_WELCOME',
      'speech': '',
      'action': action,
      'actionIncomplete': false,
      'parameters': {},
      'contexts': [{
        'name': 'google_assistant_welcome',
        'parameters': {},
        'lifespan': 0
      }, {
        'name': 'actions_capability_screen_output',
        'parameters': {},
        'lifespan': 0
      }, {
        'name': 'actions_capability_audio_output',
        'parameters': {},
        'lifespan': 0
      }, {
        'name': 'google_assistant_input_type_voice',
        'parameters': {},
        'lifespan': 0
      }, {
        'name': 'actions_capability_web_browser',
        'parameters': {},
        'lifespan': 0
      }, {'name': 'actions_capability_media_response_audio', 'parameters': {}, 'lifespan': 0}],
      'metadata': {
        'intentId': '903bd4f5-bfbd-4018-b245-961d595a492e',
        'webhookUsed': 'true',
        'webhookForSlotFillingUsed': 'false',
        'nluResponseTime': 0,
        'intentName': 'Welcome'
      },
      'fulfillment': {'speech': '', 'messages': [{'type': 0, 'speech': ''}]},
      'score': 1
    },
    'status': {'code': 200, 'errorType': 'success', 'webhookTimedOut': false},
    'sessionId': '1518710115665'
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
    this.statusCode = 200;
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

  /**
   * just get plain speech text for matching with expectation
   */
  speech () {
    return this.body.data.google.richResponse.items.map(i => i.simpleResponse.ssml).join('\n');
  }
}

module.exports = {
  buildIntentRequest: (opts) => new MockRequest(getBody(opts)),
  MockRequest,
  MockResponse,
};
