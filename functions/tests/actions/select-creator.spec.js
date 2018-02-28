const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../actions/select-creator');
const querySlots = require('../../state/query');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockSearchCollection = require('../_utils/mocking/provider/collection');
const mockSearchCreator = require('../_utils/mocking/provider/creator');

describe('actions', () => {
  let app;
  let collection;
  let creator;
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    collection = mockSearchCollection({
      fetchDetailsResponse: {title: 'Cool Band'}
    });
    creator = mockSearchCreator({
      fetchAlbumsResponse: {
        items: [
          {coverage: 'Washington, DC', year: 1999},
          {coverage: 'Madison, WI', year: 2000},
          {coverage: 'Worcester, MA', year: 2001},
        ],
      },
    });
    action.__set__('collection', collection);
    action.__set__('creator', creator);
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
          expect(creator.fetchAlbums).to.be.calledWith('cool-band');
          expect(dialog.ask).to.be.calledOnce;
        });
    });

    it('should store selected creator', () => {
      return action.handler(app)
        .then(() => {
          expect(querySlots.getSlot(app, 'creators')).to.be.equal('cool-band');
        });
    });

    it('should suggest the top 3 concerts of creator', () => {
      return action.handler(app)
        .then(() => {
          expect(dialog.ask).to.be.calledOnce;
          expect(dialog.ask.args[0][1])
            .to.have.property('suggestions')
            .to.have.length(3);
          expect(dialog.ask.args[0][1].suggestions)
            .to.have.members([
              'Washington, DC 1999',
              'Madison, WI 2000',
              'Worcester, MA 2001',
            ]);
        });
    });
  });
});
