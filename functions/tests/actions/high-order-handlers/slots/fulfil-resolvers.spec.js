const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/fulfil-resolvers');
const query = require('../../../../src/state/query');

const mockApp = require('../../../_utils/mocking/app');
const mockTemplateResolvers = require('../../../_utils/mocking/template-resolver');

describe('actions', () => {
  describe('middlewares', () => {
    describe('fulfil resolvers', () => {
      let creatorHandler;
      let revert;
      let templateResolvers;
      let yearsintervalHandler;

      beforeEach(() => {
        creatorHandler = sinon.stub().returns(Promise.resolve({title: 'Grateful Dead'}));
        yearsintervalHandler = sinon.stub().returns(Promise.resolve({suggestions: 'between 1970 and 2000'}));
        templateResolvers = mockTemplateResolvers([{
          handler: creatorHandler,
          name: 'creator',
        }, {
          handler: yearsintervalHandler,
          name: 'yearsinterval',
        }]);
        expect(middleware.__get__('templateResolvers')).to.be.ok;
        revert = middleware.__set__('templateResolvers', templateResolvers);
      });

      afterEach(() => {
        revert();
      });

      it('should works with more than one resolvers', () => {
        const app = mockApp({
          argument: {
            // category: 'plate',
          },
        });
        const speech = 'Ok, {{creator.title}} has played in {{coverage}} sometime {{yearsinterval.suggestions}}. Do you have a particular year in mind?';
        const slotsScheme = {};
        return Promise.resolve({app, query, slotsScheme, speech})
          .then(middleware())
          .then(({slots}) => {
            expect(templateResolvers.getTemplateResolvers).to.have.been.calledWith(
              speech,
              []
            );
            expect(slots).to.be.deep.equal({
              creator: {
                title: 'Grateful Dead',
              },
              yearsinterval: {
                suggestions: 'between 1970 and 2000',
              },
            });
          });
      });
    });
  });
});
