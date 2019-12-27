const { expect } = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/title-option');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('title option handler', () => {
    it('should store title option', () => {
      const app = mockApp({
        getByName: {
          value: 'false',
        }
      });

      action.handler(app);
      expect(dialog.ask).to.be.called;
      expect(app.persist.setData).to.have.been.calledWith(
        'playback', { muteSpeech: true }
      );
    });
  });
});
