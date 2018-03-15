const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/title-option');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

const playback = require('../../src/state/playback');

describe('actions', () => {
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('title option handler', () => {
    it('should store title option', () => {
      let app = mockApp({
        arguments: {
          value: 'false',
        },
      });

      playback.setMuteSpeechBeforePlayback(app, true);
      expect(playback.isMuteSpeechBeforePlayback(app)).to.be.equal(true);
      action.handler(app);
      expect(dialog.ask).to.be.called;
      expect(playback.isMuteSpeechBeforePlayback(app)).to.be.equal(false);
    });
  });
});
