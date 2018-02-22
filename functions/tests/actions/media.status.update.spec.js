const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/media-status-update');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let app;
  let dialog;

  beforeEach(() => {
    app = mockApp();
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('media status update', () => {
    it('finished', () => {
      app.MEDIA_STATUS.extension.status = app.Media.Status.FINISHED;
      action.handler(app);
      expect(dialog.song).to.be.calledOnce;
    });
  });
});
