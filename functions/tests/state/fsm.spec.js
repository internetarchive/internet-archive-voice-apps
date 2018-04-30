const {expect} = require('chai');

const fsm = require('../../src/state/fsm');

const appMock = require('../_utils/mocking/platforms/app');

describe('state', () => {
  describe('fsm', () => {
    let app;

    beforeEach(() => {
      app = appMock();
    });

    describe('getState and setState', () => {
      it('should have undefined state by default', () => {
        expect(fsm.getState(app)).to.be.undefined;
      });

      it('should set state of fsm', () => {
        fsm.setState(app, 'playback');
        expect(fsm.getState(app)).to.be.equal('playback');
      });
    });
  });
});
