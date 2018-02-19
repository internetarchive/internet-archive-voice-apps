const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const mockApp = require('../_utils/mocking/app');
const handler = rewire('../../actions/welcome');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = {
      ask: sinon.spy(),
    };
    handler.__set__('dialog', dialog);
  });

  describe('welcome', () => {
    it('should ...', () => {
      let app = mockApp();
      handler.welcome(app);
      expect(dialog.ask).have.been.calledOnce;
    });
  });
});
