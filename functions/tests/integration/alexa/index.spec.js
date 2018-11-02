const dynamoDbPersistenceAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const fs = require('fs');
const expect = require('chai').expect;
const yaml = require('js-yaml');
const lodash = require('lodash');
const path = require('path');
const sinon = require('sinon');
const VirtualAlexa = require('virtual-alexa').VirtualAlexa;
const util = require('util');

const { info } = require('../../../src/utils/logger')('ia:tests:integration:alexa');

const DynamoDBMock = require('../../_utils/mocking/dynamodb');

function expectOrNot (target, inverted) {
  if (inverted) {
    return expect(target).not;
  } else {
    return expect(target);
  }
}

/**
 * Validate assistant/alexa response
 *
 * @private
 * @param res
 * @param rule
 */
function validateResponse (res, rule, inverted = false) {
  if (typeof rule === 'string') {
    expect(res.response.outputSpeech).to.exist;
    expect(res.response.outputSpeech.ssml).to.exist;
    expectOrNot(res.response.outputSpeech.ssml, inverted).to.include(rule);
    return;
  }

  if ('without' in rule) {
    return validateResponse(res, rule.without, !inverted);
  }

  if ('all' in rule) {
    rule.all.forEach(subRule => validateResponse(res, subRule, inverted));
    return;
  }

  if ('endSessions' in rule) {
    expectOrNot(res.response, inverted).to.have.property('shouldEndSession', rule.endSessions);
    if (Object.keys(rule).length === 1) {
      // we don't have other parameters to check
      return;
    }
  }

  if ('tells' in rule) {
    expect(res.response.outputSpeech).to.exist;
    expect(res.response.outputSpeech.ssml).to.exist;
    expectOrNot(res.response.outputSpeech.ssml, inverted).to.include(rule.tells);
  } else if ('regexp' in rule) {
    expect(res.response.outputSpeech).to.exist;
    expect(res.response.outputSpeech.ssml).to.exist;
    expectOrNot(res.response.outputSpeech.ssml, inverted).to.match(new RegExp(rule.regexp));
  } else if ('directive' in rule) {
    expect(res.response).to.have.property('directives');
    expect(res.response.directives).to.be.an('array');
    expectOrNot(res.response.directives[0], inverted).to.have.property('type', rule.directive);
  } else {
    throw new Error(`doesn't support response: ${util.inspect(rule, { depth: null })}`);
  }
}

describe('integration', () => {
  let alexa;
  let sandbox;
  let axiosMock;

  let scenarios = [];
  try {
    scenarios = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'dialog.yaml'), 'utf8'));
  } catch (e) {
    console.error(e);
  }

  describe('alexa', () => {
    scenarios.forEach(({ scenario, only = false, skip = false, dialog = [], launch = '' }) => {
      let describeScenario = only ? describe.only : (skip ? describe.skip : describe);
      describeScenario(`dialog: "${scenario}"`, () => {
        before(() => {
          // mock requests to IA
          axiosMock = new MockAdapter(axios);
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20collection:etree%20AND%20creator:%22grateful%20dead%22&fl%5B%5D=coverage,year&sort%5B%5D=downloads+desc&rows=3&output=json'
          ).reply(200, require('../../fixtures/coverage-and-year.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=coverage:washington%20AND%20collection:etree%20AND%20creator:%22grateful%20dead%22&fl%5B%5D=year&rows=150&output=json'
          ).reply(200, require('../../fixtures/years.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=coverage:washington%20AND%20collection:etree%20AND%20creator:%22grateful%20dead%22%20AND%20year:1970&fl%5B%5D=identifier,coverage,title,year&rows=3&output=json'
          ).reply(200, require('../../fixtures/albums.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?' +
            'q=coverage:kharkiv%20AND%20' +
            'collection:etree%20AND%20' +
            'creator:%22grateful%20dead%22&' +
            'fl%5B%5D=year&rows=150&output=json'
          ).reply(200, require('../../provider/fixtures/empty-response.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?' +
            'q=coverage:%22new%20york%22%20AND%20' +
            'collection:etree%20AND%20' +
            'creator:%22grateful%20dead%22%20AND%20' +
            'year:1900&' +
            'fl%5B%5D=identifier,coverage,title,year&rows=3&output=json'
          ).reply(200, require('../../provider/fixtures/empty-response.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?' +
            'q=coverage:%22new%20york%22%20AND%20' +
            'collection:etree%20AND%20' +
            'creator:%22grateful%20dead%22&' +
            'fl%5B%5D=year&rows=150&output=json'
          ).reply(200, require('../../provider/fixtures/empty-response.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20collection:georgeblood%20AND%20subject:jazz&fl%5B%5D=identifier,coverage,title,year&sort%5B%5D=random&rows=2&output=json'
          ).reply(200, require('../../fixtures/albums.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20subject:jazz%20AND%20(collection:etree%20OR%20collection:georgeblood)&fl%5B%5D=identifier,coverage,title,year&sort%5B%5D=random&rows=2&output=json'
          ).reply(200, require('../../fixtures/albums.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/metadata/gd70-10-23.aud.wolfson.15080.sbefail.shnf'
          ).reply(200, require('../../fixtures/gd70-10-23.aud.wolfson.15080.sbefail.shnf.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=collection:etree&fl%5B%5D=creator,identifier&sort%5B%5D=downloads+desc&rows=3&output=json'
          ).reply(200, require('../../provider/fixtures/popular-of-etree.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20year:1990%20AND%20subject:folk%20AND%20(collection:etree%20OR%20collection:georgeblood)&fl%5B%5D=identifier,coverage,title,year&sort%5B%5D=random&rows=2&output=json'
          ).reply(200, require('../../provider/fixtures/empty-response.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20year:1910%20AND%20(collection:etree%20OR%20collection:georgeblood)&fl%5B%5D=coverage,year&sort%5B%5D=downloads+desc&rows=3&output=json'
          ).reply(200, require('../../provider/fixtures/coverages-of-1910.json'));
          axiosMock.onGet(
            'https://askills-api.archive.org/advancedsearch.php?q=_exists_:coverage%20AND%20year:1990%20AND%20(collection:etree%20OR%20collection:georgeblood)&fl%5B%5D=coverage,year&sort%5B%5D=downloads+desc&rows=3&output=json'
          ).reply(200, require('../../provider/fixtures/empty-response.json'));
          axiosMock.onGet(
          ).reply(400);

          // mock attributes persistance
          sandbox = sinon.createSandbox({});
          sandbox.replace(dynamoDbPersistenceAdapter, 'DynamoDbPersistenceAdapter', DynamoDBMock);

          // always choose 1st option
          sandbox.replace(lodash, 'sample', sinon.stub().callsFake(ops => ops[0]));

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
            return alexa
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
        } else {
          it('should launch skill', () => {
            return alexa
              .filter((req) => {
                req.context.System.device.supportedInterfaces.Display = {};
                req.context.System.device.supportedInterfaces.VideoApp = {};
                return req;
              })
              .launch();
          });
        }

        dialog.forEach(({ user, assistant }) => {
          it(`should utter: "${util.inspect(user, { depth: null })}" and get a response: "${JSON.stringify(assistant)}"`, () => {
            let res;
            if (typeof (user) === 'string') {
              info(`>> user tells: ${user}`);
              res = alexa.utter(user);
            } else if ('intend' in user) {
              info(`>> user intends: ${user.intend}`);
              res = alexa.intend(user.intend);
            } else {
              throw new Error(`We don't support user scheme ${util.inspect(user, { depth: null })}`);
            }

            return res.then(res => {
              expect(res).to.have.property('response').to.be.not.undefined;
              if (assistant !== undefined) {
                if (res.response.outputSpeech) {
                  info(`>> assistant responses: ${res.response.outputSpeech.ssml}`);
                }

                validateResponse(res, assistant);
              }
            });
          });
        });
      });
    });
  });
});
