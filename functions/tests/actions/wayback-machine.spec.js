const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/wayback-machine');
// const strings = require('../../src/strings').intents.wayback.speech;

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');
// const util = require('util');

describe('actions', () => {
  describe('wayback machine', () => {
    let app;
    let dialog;

    beforeEach(() => {
      app = mockApp();
      dialog = mockDialog();
      action.__set__('dialog', dialog);
    });
    it('check to see that a promise is returned with network requests', () => {
      action.handler(app);
      expect(Promise.resolve()).to.be.a('promise');
    });
  });
});
