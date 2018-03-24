const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/media-status-update');
const playlist = require('../../src/state/playlist');
const query = require('../../src/state/query');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockMiddlewares = require('../_utils/mocking/middlewares');

describe('actions', () => {
  let app;
  let dialog;
  let middlewares;

  beforeEach(() => {
    app = mockApp();
    dialog = mockDialog();
    action.__set__('dialog', dialog);
    middlewares = mockMiddlewares([
      'feederFromPlaylist',
      'fulfilResolvers',
      'nextSong',
      'playSong',
      'parepareSongData',
      'renderSpeech',
    ]);
    action.__set__(middlewares);
  });

  describe('media status update', () => {
    it('should play next song if we have one', () => {
      app.MEDIA_STATUS.extension.status = app.Media.Status.FINISHED;
      return action.handler(app)
        .then(() => {
          expect(middlewares.feederFromPlaylist.middleware).to.be.calledWith({
            app,
            query,
            playlist,
          });
        });
    });
  });
});
