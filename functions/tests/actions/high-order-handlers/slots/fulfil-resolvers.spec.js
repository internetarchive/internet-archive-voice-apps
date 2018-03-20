const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/fulfil-resolvers');

const mockTemplateResolvers = require('../../../_utils/mocking/template-resolver');

describe('actions', () => {
  describe('middlewares', () => {
    describe('fulfil resolvers', () => {
      let creatorHandler;
      let revert;
      const speech = 'Ok, {{creator.title}} has played in {{coverage}} sometime {{yearsinterval.suggestions}}. Do you have a particular year in mind?';
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
        return Promise.resolve({speech})
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

      it('should extend passed slots', () => {
        const slots = {
          collectionId: '12345',
        };
        return Promise.resolve({slots, speech})
          .then(middleware())
          .then(({slots}) => {
            expect(templateResolvers.getTemplateResolvers).to.have.been.calledWith(
              speech,
              ['collectionId']
            );
            expect(slots).to.be.deep.equal({
              collectionId: '12345',
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
