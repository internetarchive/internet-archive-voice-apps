const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const action = rewire('../../actions/music-query');
const {getSlot, setSlot} = require('../../state/query');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

const strings = {
  greetings: [
    '{{coverage}} - good place!',
    '{{coverage}} {{year}} - great choice!',
    '{{year}} - it was excellent year!',
  ],

  prompts: [{
    requirements: [
      'collection'
    ],

    prompts: [
      'Would you like to listen to music from our collections of 78s or Live Concerts?',
    ],

    suggestions: [
      '78s',
      'Live Concerts',
    ],
  }, {
    requirements: [
      'creator'
    ],

    prompts: [
      'What artist would you like to listen to, e.g. the Grateful Dead, the Ditty Bops, or the cowboy junkies?',
    ],
  }, {
    requirements: [
      'coverage',
      'year',
    ],

    prompts: [
      'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?',
    ],
  }],

  slots: {
    'collection': {},
    'creator': {},
    'coverage': {},
    'year': {},
  },
};

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
    action.__set__('intentStrings', strings);
  });

  describe('music query', () => {
    it('should fill single slot', () => {
      app = mockApp({
        argument: {
          collection: 'live',
        },
      });
      return action.handler(app)
        .then(() => {
          expect(getSlot(app, 'collection')).to.be.equal('live');
          expect(getSlot(app, 'creator')).to.be.undefined;
          expect(getSlot(app, 'coverage')).to.be.undefined;
          expect(getSlot(app, 'year')).to.be.undefined;
        });
    });

    it('should fill multiple slots', () => {
      app = mockApp({
        argument: {
          coverage: 'Kharkiv',
          year: 2017,
        },
      });
      return action.handler(app)
        .then(() => {
          expect(getSlot(app, 'collection')).to.be.undefined;
          expect(getSlot(app, 'creator')).to.be.undefined;
          expect(getSlot(app, 'coverage')).to.be.equal('Kharkiv');
          expect(getSlot(app, 'year')).to.be.equal(2017);
        });
    });

    it('should greet', () => {
      app = mockApp({
        argument: {
          coverage: 'Kharkiv',
          year: 2017,
        },
      });
      return action.handler(app)
        .then(() => {
          expect(dialog.ask).to.have.been.calledOnce;
          expect(dialog.ask.args[0][1])
            .to.have.property('speech')
            .to.include('Kharkiv 2017 - great choice!');
        });
    });

    it('should prompt to the next slot with a question', () => {
      app = mockApp({
        argument: {
          collection: 'live',
        },
      });
      return action.handler(app)
        .then(() => {
          expect(dialog.ask).to.have.been.calledOnce;
          expect(dialog.ask.args[0][1])
            .to.have.property('speech')
            .to.include('What artist would you like to listen to, e.g. the Grateful Dead, the Ditty Bops, or the cowboy junkies?');
        });
    });

    describe('suggestions', () => {
      it('should return list of statis suggestions', () => {
        app = mockApp({
          argument: {
            // collection: 'live',
          },
        });
        return action.handler(app)
          .then(() => {
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('suggestions')
              .to.have.members(['78s', 'Live Concerts']);
          });
      });

      it('should generate suggestions on fly', () => {
        const provider = sinon.stub().returns(Promise.resolve({
          items: [
            {coverage: 'barcelona'},
            {coverage: 'london'},
            {coverage: 'lviv'},
            {coverage: 'tokyo'},
          ],
        }));
        const getSuggestionProviderForSlots = sinon.stub().returns(provider);
        action.__set__('getSuggestionProviderForSlots', getSuggestionProviderForSlots);

        app = mockApp({
          argument: {
            collection: 'live',
            year: 2018,
          },
        });
        return action.handler(app)
          .then(() => {
            expect(provider).to.have.been.calledWith({
              collection: 'live',
              year: 2018,
            });
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('suggestions')
            // fetch bands for the collection
              .to.have.members(['barcelona', 'london', 'lviv']);
          });
      });
    });
  });
});
