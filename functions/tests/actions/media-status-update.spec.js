const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const action = rewire('../../src/actions/media-status-update');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockMiddlewares = require('../_utils/mocking/middlewares');

describe('actions', () => {
  let app;
  let dialog;
  let helpers;
  let middlewares;

  beforeEach(() => {
    app = mockApp({
      getByName: {
        MEDIA_STATUS: {
          status: 'FINISHED',
        }
      },
    });

    helpers = {
      playSong: sinon.stub().resolves(),
    };

    dialog = mockDialog();
    action.__set__('dialog', dialog);
    action.__set__('helpers', helpers);
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
      // conv.arguments.get('');
      // app.MEDIA_STATUS.extension.status = app.Media.Status.FINISHED;
      return action.handler(app)
        .then(() => {
          expect(helpers.playSong).to.have.been.calledWith({app, next: true});
        });
    });
  });
});
