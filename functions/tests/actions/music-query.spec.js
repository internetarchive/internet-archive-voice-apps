const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/music-query');
const {getSlot} = require('../../state/query');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');


describe('actions', () => {
  let app;
  let dialog;

  beforeEach(() => {
    app = mockApp({
      argument: {
        collection: 'live',
        creator: 'the-band',
        coverage: 'ny',
      },
    });
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('music query', () => {
    it('should feel slot', () => {
      action.handler(app);
      expect(getSlot(app, 'collection')).to.be.equal('live');
    });

    it('should greet', () => {

    });

    it('should ask next question', () => {

    });
  });
});
