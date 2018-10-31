const { expect } = require('chai');

const constants = require('../../src/constants');
const fsm = require('../../src/state/fsm');

const mockApp = require('../_utils/mocking/platforms/app');
const playbackFinished = require('../../src/actions/playback-finished');

describe('actions', () => {
  describe('playback finished', () => {
    let app;

    beforeEach(() => {
      app = mockApp();
    });

    it('should store offset', () => {
      expect(fsm.getState(app)).to.be.undefined;
      playbackFinished.handler(app);
      expect(fsm.getState(app)).to.be.equal(constants.fsm.states.PLAYBACK_IS_STOPPED);
    });
  });
});
