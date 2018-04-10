const {expect} = require('chai');
const rewire = require('rewire');

const version = rewire('../../src/actions/version');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = mockDialog();
    version.__set__('dialog', dialog);
    version.__set__('packageJSON.version', '1.2.3');
  });

  describe('version', () => {
    it('should tell current app version', () => {
      let app = mockApp();
      version.handler(app);
      expect(dialog.ask).have.been.calledOnce;
      expect(dialog.ask.args[0][1]).to.have.property('reprompt');
      expect(dialog.ask.args[0][1]).to.have.property('speech')
        .to.equal('Version is 1.2.3.');
      expect(dialog.ask.args[0][1]).to.have.property('suggestions');
    });
  });
});
