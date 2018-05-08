const dynamoDbPersistenceAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const fs = require('fs');
const expect = require('chai').expect;
const yaml = require('js-yaml');
const path = require('path');
const sinon = require('sinon');
const VirtualAlexa = require('virtual-alexa').VirtualAlexa;

const popularAlbums = require('../../provider/fixtures/popular-of-etree.json');
const DynamoDBMock = require('../../_utils/mocking/dynamodb');

let tests = [];
try {
  tests = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'dialog.yaml'), 'utf8'));
} catch (e) {
  console.log(e);
}

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

    tests.forEach(({scenario, dialog}) => {
      describe(`scanario "${scenario}"`, () => {
        dialog.forEach(({user, assistant}) => {
          it(`should utter: "${user}" and get a response: "${assistant}"`, () => {
            return alexa
              .utter('live collection')
              .then(res => {
                expect(res.response.outputSpeech.ssml).to.exist;
                expect(res.response.outputSpeech.ssml).to.include(assistant);
              });
          });
        });
      });
    });
  });
});
