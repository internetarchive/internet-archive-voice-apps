const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/media-status-update');
const playlist = require('../../state/playlist');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockFeeders = require('../_utils/mocking/feeders');
const mockFeeder = require('../_utils/mocking/feeders/albums');

describe('actions', () => {
  let app;
  let dialog;

  beforeEach(() => {
    app = mockApp();
    dialog = mockDialog();
    action.__set__('dialog', dialog);
    playlist.setFeeder(app, 'test-feeder');
    const feeder = mockFeeder({
      getCurrentItemReturns: {
        track: 2,
        title: 'song 2'
      },
    });
    const feeders = mockFeeders({getByNameReturn: feeder});
    action.__set__('feeders', feeders);
  });

  describe('media status update', () => {
    it('should play next song if we have one', () => {
      app.MEDIA_STATUS.extension.status = app.Media.Status.FINISHED;
      return action.handler(app)
        .then(() => {
          expect(dialog.playSong).to.be.calledWith(app, {
            track: 2,
            title: 'song 2'
          });
        });
    });
  });
});
