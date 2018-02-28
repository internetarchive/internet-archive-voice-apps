const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/select-collection');
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
      fetchDetailsResponse: {title: 'The Best Collection'}
    });
    action.__set__('collection', collection);
    action.__set__('dialog', dialog);
    app = mockApp({
      argument: 'the-best-collection',
    });
  });

  describe('select collection handler', () => {
    it('should tell user about collection, and ask more', () => {
      return action.handler(app)
        .then(() => {
          expect(collection.fetchDetails).to.be.calledWith('the-best-collection');
          expect(dialog.ask).to.be.calledOnce;
        });
    });

    it('should store selected collection', () => {
      return action.handler(app)
        .then(() => {
          expect(querySlots.getSlot(app, 'collection')).to.be.equal('the-best-collection');
        });
    });
  });
});
