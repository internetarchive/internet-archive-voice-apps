const {expect} = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/ask');

const mockApp = require('../../../_utils/mocking/app');
const mockDialog = require('../../../_utils/mocking/dialog');

describe('actions', () => {
  describe('middlewares', () => {
    let dialog;

    beforeEach(() => {
      dialog = mockDialog();
      middleware.__set__('dialog', dialog);
    });

    describe('dialog ask', () => {
      it('should ask user with suggestions', () => {
        const app = mockApp();
        const speech = ['One', 'Two', 'Tree'];
        const suggestions = ['Red', 'Green', 'Blue'];
        return middleware()({app, speech, suggestions})
          .then(() => {
            expect(dialog.ask).to.have.been.calledWith(app, {
              speech: 'One Two Tree',
              suggestions,
            });
          });
      });
    });
  });
});
