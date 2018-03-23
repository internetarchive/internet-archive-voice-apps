const {expect} = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/play-song');

const mockApp = require('../../../_utils/mocking/app');
const mockDialog = require('../../../_utils/mocking/dialog');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    let dialog;

    beforeEach(() => {
      app = mockApp();
      dialog = mockDialog();
      middleware.__set__('dialog', dialog);
    });

    describe('play song', () => {
      it('should return Promise', () => {
        expect(middleware()({app})).to.have.property('then');
      });

      it('should play song', () => {
        const speech = 'Hello World!';
        const description = 'The Best Song';
        const slots = {
          id: '123456',
        };
        return middleware()({app, description, speech, slots})
          .then(context => {
            expect(dialog.playSong).to.have.been.called;
            expect(dialog.playSong.args[0][0]).to.be.equal(app);
            expect(dialog.playSong.args[0][1]).to.be.deep.equal({
              description,
              speech,
              id: '123456',
            });
          });
      });
    });
  });
});
