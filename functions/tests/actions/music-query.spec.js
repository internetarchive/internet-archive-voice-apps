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
    it('should fill single slot', () => {
      app = mockApp({
        argument: {
          collection: 'live',
        },
      });
      action.handler(app);
      expect(getSlot(app, 'collection')).to.be.equal('live');
      expect(getSlot(app, 'creator')).to.be.undefined;
      expect(getSlot(app, 'coverage')).to.be.undefined;
      expect(getSlot(app, 'year')).to.be.undefined;
    });

    it('should fill multiple slots', () => {
      app = mockApp({
        argument: {
          coverage: 'Kharkiv',
          year: 2017,
        },
      });
      action.handler(app);
      expect(getSlot(app, 'collection')).to.be.undefined;
      expect(getSlot(app, 'creator')).to.be.undefined;
      expect(getSlot(app, 'coverage')).to.be.equal('Kharkiv');
      expect(getSlot(app, 'year')).to.be.equal(2017);
    });

    it('should greet', () => {

    });

    it('should ask next question', () => {

    });
  });
});
