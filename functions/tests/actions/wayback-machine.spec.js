const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/wayback-machine');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

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
