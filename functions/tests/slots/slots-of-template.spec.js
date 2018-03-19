const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const templateSlots = rewire('../../src/slots/slots-of-template');

describe('slots', () => {
  describe('getListOfRequiredExtensions', () => {
    it('should return list of extension type and name', () => {
      const template =
        '{{__resolvers.creator.title}} performed in {{__resolvers.location.title}} at {{time}}';
      expect(
        templateSlots.getListOfRequiredExtensions(template)
      ).to.have.been.deep.equal([
        {extType: 'resolvers', name: 'creator'},
        {extType: 'resolvers', name: 'location'},
      ]);
    });
  });

  describe('getListOfRequiredSlots', () => {
    it('should return list of names of needed slots', () => {
      expect(
        templateSlots.getListOfRequiredSlots('{{coverage}} {{year}} - great choice!')
      ).to.have.members([
        'coverage',
        'year',
      ]);
    });
  });

  describe('getPromptsForSlots', () => {
    it('should return prompts with maximum true positive', () => {
      const prompts = [{
        requirements: [
          'collection'
        ],
        prompts: [
          'Would you like to listen to music from our collections of 78s or Live Concerts?',
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
        ],
        prompts: [
          'Which location?',
        ],
      }, {
        requirements: [
          'coverage',
          'year',
        ],
        prompts: [
          'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?',
        ],
      }];
      const slots = [
        'coverage',
        'year',
      ];
      const res = templateSlots.getPromptsForSlots(prompts, slots);
      expect(res.prompts).to.includes(
        'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?'
      );
    });

    it('should return prompts with minimum false positive', () => {
      const prompts = [{
        requirements: [
          'collection'
        ],
        prompts: [
          'Would you like to listen to music from our collections of 78s or Live Concerts?',
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
        ],
        prompts: [
          'Which location?',
        ],
      }, {
        requirements: [
          'coverage',
          'year',
        ],
        prompts: [
          'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?',
        ],
      }, {
        requirements: [
          'year',
        ],
        prompts: [
          'Which year?',
        ],
      }];
      const slots = [
        'year',
      ];
      const res = templateSlots.getPromptsForSlots(prompts, slots);
      expect(res.prompts).to.includes(
        'Which year?'
      );
    });
  });

  describe('getRequiredExtensionHandlers', () => {
    it('should return packed list of providers', () => {
      const handler1 = () => {
      };
      const handler2 = () => {
      };
      const getExtender = sinon.stub();
      getExtender.onCall(0).returns({handler: handler1});
      getExtender.onCall(1).returns({handler: handler2});
      templateSlots.__set__('extensions', {
        getExtensionTypeSet: sinon.stub().returns(getExtender),
        getExtensionTypeFromValue: sinon.stub().returns('resolvers')
      });

      expect(templateSlots.getRequiredExtensionHandlers(
        '{{__resolvers.creator.title}} performed in {{__resolvers.location.title}}'
      )).to.have.been.deep.equal([{
        handler: handler1,
        name: 'creator',
        extType: 'resolvers',
      }, {
        handler: handler2,
        name: 'location',
        extType: 'resolvers',
      }]);
    });
  });
});
