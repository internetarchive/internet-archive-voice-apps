const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../src/actions/_middlewares/find-repair-phrase');

describe('actions', () => {
  describe('middleware', () => {
    describe('find repair phrase', () => {
      let ctx;

      beforeEach(() => {
        ctx = {
          repairScheme: {
            default: {
              speech: 'default speech',
            }
          },
          slotScheme: {},
        };
      });

      it('should appropriate repair phrase based on context', () => {
        const mockTemplate = 'hello world!';
        const selectorsMock = {
          find: sinon.stub().returns(mockTemplate),
        };
        middleware.__set__('selectors', selectorsMock);
        return middleware()(ctx)
          .then(({ speech }) => {
            expect(speech).to.include('hello world!');
          });
      });

      it('should use default repair phrase if didn\'t find matched', () => {
        const selectorsMock = {
          find: sinon.stub().returns(null),
        };
        middleware.__set__('selectors', selectorsMock);
        return middleware()(ctx)
          .then(({ speech }) => {
            expect(speech).to.include('default speech');
          });
      });
    });
  });
});
