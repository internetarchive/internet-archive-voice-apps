const {expect} = require('chai');
const rewire = require('rewire');
const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const welcome = rewire('../../actions/welcome');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = mockDialog();
    welcome.__set__('dialog', dialog);
  });

  describe('welcome', () => {
    it('should ask user', () => {
      let app = mockApp();
      welcome.handler(app);
      expect(dialog.ask).have.been.calledOnce;
    });
  });
});
