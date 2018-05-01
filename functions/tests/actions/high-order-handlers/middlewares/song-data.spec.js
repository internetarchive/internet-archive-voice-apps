const {expect} = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/song-data');

const mockApp = require('../../../_utils/mocking/platforms/app');
const mockFeeder = require('../../../_utils/mocking/feeders/albums');
const mockSelectors = require('../../../_utils/mocking/selectors');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    let feeder;
    let selectors;
    let strings = {
      description: 'description',
      wordless: [{speech: 'speech'}],
    };

    beforeEach(() => {
      app = mockApp();
      feeder = mockFeeder();
      selectors = mockSelectors({findResult: [strings, strings.wordless[0]]});
      middleware.__set__('feeder', feeder);
      middleware.__set__('selectors', selectors);
    });

    describe('song data', () => {
      it('should return Promise', () => {
        expect(middleware()({app, feeder})).to.have.property('then');
      });

      it('should play song', () => {
        const slots = {
          id: '123456',
        };
        return middleware()({app, feeder, slots})
          .then(context => {
            expect(context).to.have.property('description', strings.description);
            expect(context).to.have.property('speech')
              .with.members([strings.wordless[0].speech]);
            expect(context).to.have.property('slots')
              .which.deep.equal({
              id: slots.id,
            });
          });
      });

      it('should concat new speech with new one', () => {
        const slots = {
          id: '123456',
        };
        const firstSpeech = 'Hello World';
        return middleware()({app, feeder, slots, speech: [firstSpeech]})
          .then(context => {
            expect(context).to.have.property('speech').with.members([
              firstSpeech,
              strings.wordless[0].speech,
            ]);
          });
      });

      it('should concat new speech with new one', () => {
        selectors = mockSelectors({findResult: [strings, null]});
        middleware.__set__('feeder', feeder);
        middleware.__set__('selectors', selectors);

        const slots = {
          id: '123456',
        };
        const firstSpeech = 'Hello World';
        return middleware()({app, feeder, slots, speech: [firstSpeech]})
          .then(context => {
            expect(context).to.have.property('speech').with.members([
              firstSpeech,
            ]);
          });
      });

      it('should escape song title', () => {
        feeder = mockFeeder({
          getCurrentItemReturns: {
            title: '"Last Night Blues',
            creator: [
              'Joe Liggins & His Honeydrippers',
              'Joe Liggins',
              '"Little" Willie Jackson',
            ],
            track: 1,
            year: 1947,
            someInnerObject: {
              quot: '"',
              amp: "&",
            },
          }
        });
        return middleware()({app, feeder, slots: {}})
          .then(ctx => {
            expect(ctx.slots).to.have.property('title', '&quot;Last Night Blues');
            expect(ctx.slots).to.have.property('creator')
              .to.have.members([
                'Joe Liggins &amp; His Honeydrippers',
                'Joe Liggins',
                '&quot;Little&quot; Willie Jackson',
              ]);
            expect(ctx.slots).to.have.property('track', 1);
            expect(ctx.slots).to.have.property('year', 1947);
            expect(ctx.slots).to.have.property('someInnerObject')
              .to.be.deep.equal({
                quot: '&quot;',
                amp: '&amp;',
              })
          });
      });
    });
  });
});
