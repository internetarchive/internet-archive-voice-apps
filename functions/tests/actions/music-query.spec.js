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
    'Ok! Lets go with {{_resolver.creator.title}} band!',
    `You've selected {{_resolver.collection.title}}`,
  ],

  prompts: [{
    requirements: [
      'collection'
    ],

    prompts: [
      'Would you like to listen to music from our collections of {{suggestions.humanized}}?',
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
      'What artist would you like to listen to, e.g. {{suggestions.humanized}}?',
    ],
  }, {
    requirements: [
      'coverage',
      'year',
    ],

    prompts: [
      'Do you have a specific city and year in mind, like {{suggestions.values.0}}, or would you like me to play something randomly?',
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
  let getSuggestionProviderForSlots;
  let provider;

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

    provider = sinon.stub().returns(Promise.resolve({
      items: [
        {coverage: 'barcelona'},
        {coverage: 'london'},
        {coverage: 'lviv'},
        {coverage: 'tokyo'},
      ],
    }));
    getSuggestionProviderForSlots = sinon.stub().returns(provider);
    action.__set__('getSuggestionProviderForSlots', getSuggestionProviderForSlots);
  });

  describe('music query', () => {
    describe('slot updater', () => {
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
    });

    describe('greetings', () => {
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

      xit('should substitute resolved slots', () => {
        app = mockApp({
          argument: {
            creatorId: 'bandId',
          },
        });
        return action.handler(app)
          .then(() => {
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('speech')
              .to.include('Ok! Lets go with Grateful Dead band!');
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
              .to.include('What artist would you like to listen to, e.g. barcelona, london or lviv?');
          });
      });
    });


    describe('suggestions', () => {
      it('should return list of statis suggestions', () => {
        app = mockApp({
          argument: {},
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

      it('should use suggestion to generate prompt speech', () => {
        app = mockApp({
          argument: {},
        });
        return action.handler(app)
          .then(() => {
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('speech')
              .to.include(
              'Would you like to listen to music from our collections of 78s or Live Concerts?'
            );
          });
      });

      it('should use one suggestion to generate prompt speech', () => {
        provider = sinon.stub().returns(Promise.resolve({
          items: [
            {coverage: 'Washington, DC', year: 1973},
            {coverage: 'Madison, WI', year: 2000},
            {coverage: 'Worcester, MA', year: 2001},
          ],
        }));
        getSuggestionProviderForSlots = sinon.stub().returns(provider);
        action.__set__('getSuggestionProviderForSlots', getSuggestionProviderForSlots);

        app = mockApp({
          argument: {
            collection: 'live',
            creator: 'the band',
          },
        });
        return action.handler(app)
          .then(() => {
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('speech')
              .to.include(
              'Do you have a specific city and year in mind, like Washington, DC 1973, or would you like me to play something randomly?'
            );
          });
      });
    });
  });
});
