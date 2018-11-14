const { expect } = require('chai');
const sinon = require('sinon');

const strings = require('../../src/strings');

const { buildIntentRequest, MockResponse } = require('../_utils/mocking');
const { wait } = require('../_utils/wait');

let index, configStub, adminInitStub, functions, admin;

describe('integration', () => {
  before(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`../.runtimeconfig.json`));
    index = require('../..');
  });

  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });

  describe('no-input', () => {
    it('should speechout 1st time', () => {
      const res = new MockResponse();

      index.assistant(buildIntentRequest({
        action: 'no-input',
      }), res);

      return wait()
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userResponse()).to.be.true;
          expect(res.speech()).to.contain(strings.intents.noInput[0].speech);
        });
    });

    it('should speechout 2nd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
        userStorage: {
          dialog: {
            lastPhrase: {
              reprompt: 'Direction?',
            }
          },
          actions: {
            action: 'no-input',
            count: 1,
          },
        },
      });

      index.assistant(req, res);

      return wait()
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userResponse()).to.be.true;
          expect(res.speech()).to.contain(
            strings.intents.noInput[1].speech.replace('{{reprompt}}', 'Direction?')
          );
        });
    });

    it('should speechout 3rd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
        userStorage: {
          actions: {
            action: 'no-input',
            count: 2,
          },
        },
      });

      index.assistant(req, res);

      return wait()
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userResponse()).to.be.false;
          expect(res.speech()).to.contain(strings.intents.noInput[2].speech);
        });
    });

    it('should not fallback 3rd time if previous action was not no-input', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
        userStorage: {
          actions: {
            action: 'some.other.action',
            count: 2,
          },
        },
      });

      index.assistant(req, res);

      return wait()
        .then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userResponse()).to.be.true;
          expect(res.speech()).to.contain(strings.intents.noInput[0].speech);
        });
    });
  });
});
