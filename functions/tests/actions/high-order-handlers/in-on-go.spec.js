const {expect} = require('chai');

const builder = require('../../../actions/high-order-handlers/in-one-go');
const query = require('../../../state/query');
const mockApp = require('../../_utils/mocking/app');

const strings = require('./fixtures/in-on-go.json');

describe('actions', () => {
  describe('high-order handlers', () => {
    describe('in one go handler', () => {
      describe('interface', () => {
        it('should have build method', () => {
          expect(builder).to.have.property('build');
        });

        it('should create object with handler method', () => {
          expect(builder.build(strings)).to.have.property('handler');
        });
      });

      describe('instance', () => {
        let action;
        let app;

        beforeEach(() => {
          action = builder.build(strings, query);
        });

        it('should populate to slots passed arguments', () => {
          app = mockApp({
            argument: {
              creators: 'the-band',
            },
          });
          return action.handler(app)
            .then(() => {
              expect(query.getSlots(app)).to.be.deep.equal({
                creators: 'the-band',
              });
            });
        });
      });
    });
  });
});
