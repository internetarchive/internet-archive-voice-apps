const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/select-creator');
const querySlots = require('../../state/query');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockSearchCollection = require('../_utils/mocking/provider/collection');

describe('actions', () => {
  let app;
  let collection;
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    collection = mockSearchCollection({
      fetchDetailsResponse: {title: 'Cool Band'}
    });
    action.__set__('collection', collection);
    action.__set__('dialog', dialog);
    app = mockApp({
      argument: 'cool-band',
    });
  });

  describe('select creator handler', () => {
    it('should tell user about creator, and ask more', () => {
      return action.handler(app)
        .then(() => {
          expect(collection.fetchDetails).to.be.calledWith('cool-band');
          expect(dialog.ask).to.be.calledOnce;
        });
    });

    it('should store selected creator', () => {
      return action.handler(app)
        .then(() => {
          expect(querySlots.getSlot(app, 'creator')).to.be.equal('cool-band');
        })
    })
  });
});
