const { expect } = require('chai');
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
        playback: {
          default: sinon.spy(),
          help: { default: sinon.spy() },
          subscription: {
            hide: { default: sinon.spy() },
            show: { default: sinon.spy() },
          },
        },
      };
    });

    describe('getters', () => {
      describe('getLastState', () => {
        it('should have undefined state by default', () => {
          expect(fsm.getLastState(app)).to.be.undefined;
        });

        it('should set state of fsm', () => {
          fsm.transitionTo(app, 'playback');
          expect(fsm.getLastState(app)).to.be.equal('playback');
        });

        it('should alwasy return the last state', () => {
          fsm.transitionTo(app, 'playback');
          fsm.transitionTo(app, 'subscription');
          fsm.transitionTo(app, 'show');
          expect(fsm.getLastState(app)).to.be.equal('show');
        });
      });

      describe('getHistory', () => {
        it('should have empty state history by default', () => {
          expect(fsm.getHistory(app)).to.be.empty;
        });

        it('should set state of fsm', () => {
          fsm.transitionTo(app, 'playback');
          expect(fsm.getHistory(app)).to.be.deep.equal([
            'playback',
          ]);
        });

        it('should go deeper sub-state', () => {
          fsm.transitionTo(app, 'playback');
          fsm.transitionTo(app, 'help');
          expect(fsm.getHistory(app)).to.be.deep.equal([
            'playback', 'help'
          ]);
        });

        it('should go even deeper alter sub-sub-state', () => {
          fsm.transitionTo(app, 'playback');
          fsm.transitionTo(app, 'subscription');
          fsm.transitionTo(app, 'show');
          expect(fsm.getHistory(app)).to.be.deep.equal([
            'playback', 'subscription', 'show'
          ]);
        });

        it('should ignore repetition states', () => {
          fsm.transitionTo(app, 'playback');
          fsm.transitionTo(app, 'subscription');
          fsm.transitionTo(app, 'subscription');
          fsm.transitionTo(app, 'show');
          expect(fsm.getHistory(app)).to.be.deep.equal([
            'playback', 'subscription', 'show'
          ]);
        });
      });
    });

    describe('selectHandler', () => {
      it('should select matched handler', () => {
        fsm.transitionTo(app, 'playback');
        expect(fsm.selectHandler(app, handlers)).to.be.equal(handlers.playback.default);
      });

      it('should select default handler if there no any matched handlers', () => {
        fsm.transitionTo(app, 'unknown-state');
        expect(fsm.selectHandler(app, handlers)).to.be.equal(handlers.default);
      });

      it('should select sub-handler', () => {
        fsm.transitionTo(app, 'playback');
        fsm.transitionTo(app, 'help');
        expect(fsm.selectHandler(app, handlers)).to.be.equal(handlers.playback.help.default);
      });

      it(`should select sub-handler and drop head if it doesn't fit`, () => {
        fsm.transitionTo(app, 'show');
        fsm.transitionTo(app, 'playback');
        fsm.transitionTo(app, 'help');
        expect(fsm.selectHandler(app, handlers)).to.be.equal(handlers.playback.help.default);
      });
    });
  });
});
