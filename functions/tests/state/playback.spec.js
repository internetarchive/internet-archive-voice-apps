const {expect} = require('chai');

const playback = require('../../src/state/playback');

const mockApp = require('../_utils/mocking/app');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('playback', () => {
    describe('speech before songs', () => {
      it('should be mute by default', () => {
        expect(playback.isMuteSpeechBeforePlayback(app)).to.be.true;
      });

      it('should reset mute', () => {
        playback.setMuteSpeechBeforePlayback(app, false);
        expect(playback.isMuteSpeechBeforePlayback(app)).to.be.false;
      });
    });
  });
});
