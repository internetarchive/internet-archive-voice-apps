const {expect} = require('chai');

const middleware = require('../../../src/dialog/middlewares/replace-speech-if-muted');
const playback = require('../../../src/state/playback');
const strings = require('../../../src/strings').dialog.playSong;

const mockApp = require('../../_utils/mocking/app');

describe('dialog', () => {
  describe('middlewares', () => {
    describe('replace speech if muted', () => {
      let app;
      let options;

      beforeEach(() => {
        app = mockApp();
        options = {
          speech: 'hello world!',
          description: 'one song',
        };
      });

      it(`should left the same options if speech is not muted`, () => {
        playback.setMuteSpeechBeforePlayback(app, false);
        expect(middleware()(app, Object.assign({}, options)))
          .to.be.deep.equal(options);
      });

      it(`should replace speech if it's muted with template`, () => {
        playback.setMuteSpeechBeforePlayback(app, true);
        expect(middleware()(app, Object.assign({}, options)))
          .to.have.property('speech', strings.speech);
      });
    });
  });
});
