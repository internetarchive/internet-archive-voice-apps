const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const mockApp = require('../_utils/mocking/platforms/app');
const playbackFailed = rewire('../../src/actions/playback-failed');

describe('actions', () => {
  describe('playback failed', () => {
    let app;
    let helpers;
    let warning;

    beforeEach(() => {
      app = mockApp({
        getData: {
          playlist: {
            current: 0,
            items: [{
              audioUrl: 'http://archive.org/download/nms2014-09-06.mtx.flac16/Nms2014-09-06D1t02.mp3',
            }]
          },
        },

        getRequestError: {
          message: 'Player error occurred: java.lang.IllegalStateException',
          type: 'MEDIA_ERROR_UNKNOWN',
        },

        offset: 12345,
      });

      helpers = {
        playSong: sinon.stub().resolves(),
      };

      warning = sinon.spy();
      playbackFailed.__set__('helpers', helpers);
      playbackFailed.__set__('warning', warning);
    });

    it('should log failed case', () => {
      playbackFailed.handler(app);

      expect(warning).to.be.called;
      expect(warning.args[0][0]).to.include(
        'http://archive.org/download/nms2014-09-06.mtx.flac16/Nms2014-09-06D1t02.mp3'
      );
      expect(warning.args[0][0]).to.include(
        'MEDIA_ERROR_UNKNOWN'
      );
      expect(warning.args[0][0]).to.include(
        'Player error occurred: java.lang.IllegalStateException'
      );
    });

    it('should play next song', () => {
      playbackFailed.handler(app);
      expect(helpers.playSong).to.have.been.called;
      expect(helpers.playSong.args[0][0]).to.deep.equal({ app, skip: 'forward' });
    });
  });
});
