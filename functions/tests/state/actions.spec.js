const {expect} = require('chai');

const {getLastAction, storeAction, getLastRepetitionCount, storeRepetitionCount} = require('../../src/state/actions');

const mockApp = require('../_utils/mocking/app');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('actions', () => {
    it('should store action', () => {
      storeAction(app, 'welcome');
      expect(getLastAction(app)).to.be.equal('welcome');
    });

    it('should modify count', () => {
      storeRepetitionCount(app, 123);
      expect(getLastRepetitionCount(app)).to.be.equal(123);
    });

    it('should zero count if new action is come', () => {
      storeAction(app, 'welcome');
      storeRepetitionCount(app, 123);
      storeAction(app, 'run');
      expect(getLastRepetitionCount(app)).to.be.equal(1);
    });

    it('should increase count if new action is the same as was before', () => {
      storeAction(app, 'run');
      storeRepetitionCount(app, 1);
      storeAction(app, 'run');
      expect(getLastRepetitionCount(app)).to.be.equal(2);
    });
  });
});
