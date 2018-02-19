const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const mockApp = require('../_utils/mocking/app');
const welcome = rewire('../../actions/welcome');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = {
      ask: sinon.spy(),
    };
    welcome.__set__('dialog', dialog);
  });

  describe('welcome', () => {
    it('should ...', () => {
      let app = mockApp();
      welcome.handler(app);
      expect(dialog.ask).have.been.calledOnce;
    });
  });
});
