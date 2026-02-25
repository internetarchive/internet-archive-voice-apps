const { expect } = require('chai');

const playback = require('../../src/state/playback');

const mockApp = require('../_utils/mocking/platforms/app');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('playback', () => {
    describe('speech before songs', () => {
      it('should NOT be mute by default (to preserve AudioPlayer association)', () => {
        expect(playback.isMuteSpeechBeforePlayback(app)).to.be.false;
      });

      it('should allow setting mute to true', () => {
        playback.setMuteSpeechBeforePlayback(app, true);
        expect(playback.isMuteSpeechBeforePlayback(app)).to.be.true;
      });
    });
  });
});
