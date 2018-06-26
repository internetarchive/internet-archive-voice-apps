const {expect} = require('chai');
const rewire = require('rewire');

const wayback = rewire('../../src/actions/wayback-machine');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = mockDialog();
    wayback.__set__('dialog', dialog);
    wayback.__set__('packageJSON.version', '1.2.3');
  });

  describe('wayback', () => {
    it('should tell archive.org and alexa ranking data about a url', () => {
      let app = mockApp();
      wayback.handler(app);
      expect(dialog.close.args[0][1]).to.have.property('speech');
    });
  });
});
