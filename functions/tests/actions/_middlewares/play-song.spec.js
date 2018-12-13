const { expect } = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../src/actions/_middlewares/play-song');
const constants = require('../../../src/constants');
const fsm = require('../../../src/state/fsm');

const mockApp = require('../../_utils/mocking/platforms/app');
const mockDialog = require('../../_utils/mocking/dialog');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    let dialog;
    const speech = ['Hello World!'];

    beforeEach(() => {
      app = mockApp();
      dialog = mockDialog();
      middleware.__set__('dialog', dialog);
    });

    describe('play song', () => {
      it('should return Promise', () => {
        expect(middleware()({ app, speech })).to.have.property('then');
      });

      it('should play song', () => {
        const description = 'The Best Song';
        const slots = {
          id: '123456',
        };
        return middleware({ offset: 1234 })({ app, description, speech, slots })
          .then(context => {
            expect(dialog.playSong).to.have.been.called;
            expect(dialog.playSong.args[0][0]).to.be.equal(app);
            expect(dialog.playSong.args[0][1]).to.be.deep.equal({
              description,
              id: '123456',
              mediaResponseOnly: false,
              offset: 1234,
              speech: speech[0],
            });
          });
      });

      it('should set playback state', () => {
        const description = 'The Best Song';
        const slots = {
          id: '123456',
        };
        const res = fsm.getLastState(app);
        expect(res).to.be.undefined;
        return middleware({})({ app, description, speech, slots })
          .then(context => {
            expect(fsm.getLastState(app)).to.be.equal(constants.fsm.states.PLAYBACK);
          });
      });
    });
  });
});
