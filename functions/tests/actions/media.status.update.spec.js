const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/media-status-update');
const playlist = require('../../state/playlist');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let app;
  let dialog;

  beforeEach(() => {
    app = mockApp();
    dialog = mockDialog();
    action.__set__('dialog', dialog);
    playlist.create(app, [
      {track: 1, title: 'song 1'},
      {track: 2, title: 'song 2'},
    ]);
  });

  describe('media status update', () => {
    it('should play next song if we have one', () => {
      app.MEDIA_STATUS.extension.status = app.Media.Status.FINISHED;
      action.handler(app);
      expect(dialog.song).to.be.calledWith(app, {track: 2, title: 'song 2'});
    });
  });
});
