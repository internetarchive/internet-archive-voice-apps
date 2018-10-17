const { expect } = require('chai');

const app = require('../../../../src/platform/alexa/app');

const activeSessionRequest = require('./fixtures/active-session-request.json');
const errorRequest = require('./fixtures/error-request.json');
const newSessionRequest = require('./fixtures/new-session-request.json');

describe('platform', () => {
  describe('alexa', () => {
    describe('app', () => {
      describe('getRequestError', () => {
        it('should return error passed to constructor', () => {
          const a = new app.App(errorRequest);

          expect(a.getRequestError()).to.be.deep.equal({
            message: 'Player error occurred: java.lang.IllegalStateException',
            type: 'MEDIA_ERROR_UNKNOWN',
          });
        });
      });

      describe('isNewSession', () => {
        it('should return true if it is new session', () => {
          const a = new app.App(newSessionRequest, {});
          expect(a.isNewSession()).to.be.true;
        });

        it('should return true if it in not new session', () => {
          const a = new app.App(activeSessionRequest, {});
          expect(a.isNewSession()).to.be.false;
        });
      });
    });
  });
});
