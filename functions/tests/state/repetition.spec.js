const {expect} = require('chai');
const {storeAction, getLastAction} = require('../../state/repetition');
const mockApp = require('../_utils/mocking/app');

describe('actions', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('repetition', () => {
    it('should store action', () => {
      storeAction(app, 'welcome');
      expect(getLastAction(app)).to.be.equal('welcome');
    });
  });
});
