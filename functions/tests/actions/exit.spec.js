const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/exit');
const strings = require('../../src/strings').intents.exit;

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  describe('exit', () => {
    let app;
    let dialog;

    beforeEach(() => {
      app = mockApp();
      dialog = mockDialog();
      action.__set__('dialog', dialog);
    });

    it('should tell goodbye and close session', () => {
      action.handler(app);
      expect(dialog.tell).to.have.been.calledWith(app, strings);
    });
  });
});
