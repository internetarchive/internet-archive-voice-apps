const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/select-collection');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let app;

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);
    app = mockApp({
      argument: 'the-best-collection',
    });
  });

  describe('select collection handler', () => {
    it('should tell user about collection, and ask more', () => {
      action.handler(app);
      expect(dialog.ask).to.be.calledOnce;
    });
  });
});
