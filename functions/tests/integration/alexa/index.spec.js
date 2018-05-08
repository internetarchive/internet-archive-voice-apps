const dynamoDbPersistenceAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const fs = require('fs');
const expect = require('chai').expect;
const yaml = require('js-yaml');
const path = require('path');
const sinon = require('sinon');
const VirtualAlexa = require('virtual-alexa').VirtualAlexa;

const DynamoDBMock = require('../../_utils/mocking/dynamodb');

describe('integration', () => {
  let alexa;
  let sandbox;
  let axiosMock;

  let scenarios = [];
  try {
    scenarios = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'dialog.yaml'), 'utf8'));
  } catch (e) {
    console.log(e);
  }

  describe('alexa', () => {
    scenarios.forEach(({scenario, dialog = [], launch = ''}) => {
      describe(`dialog: "${scenario}"`, () => {
        before(() => {
          // mock requests to IA
          axiosMock = new MockAdapter(axios);
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20collection:etree%20AND%20creator:%22Grateful%20Dead%22&fl%5B%5D=coverage,year&sort%5B%5D=downloads+desc&rows=3&output=json'
          ).reply(200, require('../../fixtures/coverage-and-year.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=coverage:washington%20AND%20collection:etree%20AND%20creator:%22Grateful%20Dead%22&fl%5B%5D=year&rows=150&output=json'
          ).reply(200, require('../../fixtures/years.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=coverage:washington%20AND%20collection:etree%20AND%20creator:%22Grateful%20Dead%22%20AND%20year:1970&fl%5B%5D=identifier,coverage,title,year&rows=3&output=json'
          ).reply(200, require('../../fixtures/albums.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/metadata/gd70-10-23.aud.wolfson.15080.sbefail.shnf'
          ).reply(200, require('../../fixtures/gd70-10-23.aud.wolfson.15080.sbefail.shnf.json'));
          axiosMock.onGet(
          ).reply(200, require('../../provider/fixtures/popular-of-etree.json'));

          // mock attributes persistance
          sandbox = sinon.createSandbox({});
          sandbox.replace(dynamoDbPersistenceAdapter, 'DynamoDbPersistenceAdapter', DynamoDBMock);

          alexa = VirtualAlexa.Builder()
            .handler('./index-alexa.handler')
            .interactionModelFile('../models/en-US.json')
            .create();
        });

        after(() => {
          sandbox.restore();
          axiosMock.restore();
        });

        if (launch) {
          it(`should start with: "${launch}"`, () => {
            alexa
              .filter((req) => {
                req.context.System.device.supportedInterfaces.Display = {};
                req.context.System.device.supportedInterfaces.VideoApp = {};
                return req;
              })
              .launch()
              .then((res) => {
                expect(res.response.outputSpeech.ssml).to.exist;
                expect(res.response.outputSpeech.ssml).to.include(launch);
              });
          });
        }

        dialog.forEach(({user, assistant}) => {
          it(`should utter: "${user}" and get a response: "${assistant}"`, () => {
            return alexa
              .utter(user)
              .then(res => {
                expect(res.response.outputSpeech.ssml).to.exist;
                if (typeof assistant === 'string') {
                  expect(res.response.outputSpeech.ssml).to.include(assistant);
                } else if ('directive' in assistant) {
                  expect(res.response).to.have.property('directives');
                  expect(res.response.directives).to.be.an('array');
                  expect(res.response.directives[0]).to.have.property('type', assistant.directive);
                } else {
                  throw new Error(`doesn't support response:`, assistant);
                }
              });
          });
        });
      });
    });
  });
});
