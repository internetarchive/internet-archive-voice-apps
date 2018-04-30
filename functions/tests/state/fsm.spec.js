const {expect} = require('chai');
const sinon = require('sinon');

const fsm = require('../../src/state/fsm');

const appMock = require('../_utils/mocking/platforms/app');

describe('state', () => {
  describe('fsm', () => {
    let app;
    let handlers;

    beforeEach(() => {
      app = appMock();
      handlers = {
        default: sinon.spy(),
        playback: sinon.spy(),
      };
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

    describe('selectHandler', () => {
      it('should select matched handler', () => {
        fsm.setState(app, 'playback');
        expect(fsm.selectHandler(app, handlers)).to.be.equal(handlers.playback);
      });
    });
  });
});
