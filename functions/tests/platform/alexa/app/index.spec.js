const {expect} = require('chai');

const {App} = require('../../../../src/platform/alexa/app');

describe('platform', () => {
  describe('alexa', () => {
    describe('app', () => {
      describe('getRequestError', () => {
        it('should return error passed to constructor', () => {
          const app = new App({
            requestEnvelope: {
              context: {
                System: {
                  device: {
                    deviceId: '1234567890',
                  }
                }
              },

              request: {
                error: {
                  message: 'Player error occurred: java.lang.IllegalStateException',
                  type: 'MEDIA_ERROR_UNKNOWN',
                },
              },
            },
          });

          expect(app.getRequestError()).to.be.deep.equal({
            message: 'Player error occurred: java.lang.IllegalStateException',
            type: 'MEDIA_ERROR_UNKNOWN',
          });
        });
      });
    });
  });
});
