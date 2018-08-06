// const {expect} = require('chai');
const rewire = require('rewire');

// const mockApp = require('../../../_utils/mocking/platforms/app');
const mockDialog = require('../../../_utils/mocking/dialog');

const logRequest = rewire('../../../../src/platform/assistant/middlewares/log-request.js');

describe('platform', () => {
  describe('assistant', () => {
    let dialog;

    beforeEach(() => {
      dialog = mockDialog();
      logRequest.__set__('dialog', dialog);
    });

    it('should check if a user id is present', () => {
    });
  });
});
