const {expect} = require('chai');
const rewire = require('rewire');

const templateResolvers = rewire('../../../src/configurator/parsers/template-resolvers');
const mockResolvers = require('../../_utils/mocking/extensions');

describe('configurator', () => {
  describe('parser', () => {
    describe('template resolvers', () => {
      describe('getTopLevelSlots', () => {
        it('should return list of the top level slots', () => {
          const template =
            '{{creator.title}} performed in {{location.title}} at {{time}}';
          expect(
            templateResolvers.getTopLevelSlots(template)
          ).to.have.been.deep.equal([
            'creator',
            'location',
            'time',
          ]);
        });
      });

      describe('getTemplateResolvers', () => {
        let resolvers;
        let creatorHandler;
        let locationHandler;
        let timeHandler;

        beforeEach(() => {
          creatorHandler = () => {
          };
          locationHandler = () => {
          };
          timeHandler = () => {
          };
          resolvers = mockResolvers({
            creator: {handler: creatorHandler},
            location: {handler: locationHandler},
            time: {handler: timeHandler},
          });
          templateResolvers.__set__('resolvers', resolvers);
        });

        it('should return needed resolvers', () => {
          expect(templateResolvers.getTemplateResolvers(
            '{{creator.title}} performed in {{location.title}}'
          )).to.have.been.deep.equal([{
            handler: creatorHandler,
            name: 'creator',
          }, {
            handler: locationHandler,
            name: 'location',
          }]);
        });

        it('should skip resolvers which are overwritten by filled slots', () => {
          expect(templateResolvers.getTemplateResolvers(
            '{{creator.title}} performed in {{location.title}} at {{time}}',
            ['creator', 'location']
          )).to.have.been.deep.equal([{
            handler: timeHandler,
            name: 'time',
          }]);
        });

        it('should parse empty array', () => {
          expect(templateResolvers.getTemplateResolvers([], []))
            .to.have.been.empty;
        });
      });
    });
  });
});
