const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const dynamoDbPersistenceAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const expect = require('chai').expect;
const sinon = require('sinon');
const VirtualAlexa = require('virtual-alexa').VirtualAlexa;

const popularAlbums = require('../../provider/fixtures/popular-of-etree.json');
const DynamoDBMock = require('../../_utils/mocking/dynamodb');

describe('integration', () => {
  let alexa;
  let sandbox;
  let axiosMock;

  describe('alexa', () => {
    beforeEach(() => {
      // mock requests to IA
      axiosMock = new MockAdapter(axios);
      axiosMock.onGet().reply(200, popularAlbums);

      // mock attributes persistance
      sandbox = sinon.createSandbox({});
      sandbox.replace(dynamoDbPersistenceAdapter, 'DynamoDbPersistenceAdapter', DynamoDBMock);

      alexa = VirtualAlexa.Builder()
        .handler('./index-alexa.handler')
        .interactionModelFile('../models/en-US.json')
        .create();
    });

    afterEach(() => {
      sandbox.restore();
      axiosMock.restore();
    });

    it('Should launch the skill and get a response', () =>
      alexa
        .filter((req) => {
          req.context.System.device.supportedInterfaces.Display = {};
          req.context.System.device.supportedInterfaces.VideoApp = {};
          return req;
        })
        .launch()
        .then((res) => {
          expect(res.response.outputSpeech.ssml).to.exist;
          expect(res.response.outputSpeech.ssml).to.include('Welcome to music at the Internet Archive. Would you like to listen to music from our collections of 78s or Live Concerts?');
        })
    );

    it('Should utter "live collection" and get a response', () => {
      return alexa
        .utter('live collection')
        .then(res => {
          expect(res.response.outputSpeech.ssml).to.exist;
          expect(res.response.outputSpeech.ssml).to.include('You\'ve selected Live Concerts. What artist would you like to listen to? For example, the Grateful Dead, the Phil Lesh and Friends or the Disco Biscuits?');
        })
    });
  });
});
