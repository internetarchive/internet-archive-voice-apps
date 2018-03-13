const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const templateSlots = rewire('../../src/slots/slots-of-template');

describe('slots', () => {
  describe('extractRequrements', () => {
    it('should extract plain slot requrements', () => {
      const templates = [
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'I love {{collection}} collection too',
      ];

      const res = templateSlots.extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['coverage', 'year']);
      expect(res[4]).to.have.property('requirements')
        .to.have.members(['collection']);
    });

    it('should respect dot notation', () => {
      const templates = [
        'Ok! Lets go with {{creator.title}} band!',
      ];

      const res = templateSlots.extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['creator']);
    });

    it('should fetch const requirements from resolvers', () => {
      const templates = [
        'Ok! Lets go with {{__resolvers.creator.title}} band!',
      ];

      const res = templateSlots.extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['creatorId']);
    });

    it('should fetch callback requirements from resolvers', () => {
      const templates = [
        `You've selected {{__resolvers.alias.collectionId}} collection.`,
      ];

      const res = templateSlots.extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['collectionId']);
    });
  });

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

  describe('getMatchedTemplates', () => {
    it('should find list of all templates which match provides slots', () => {
      const templates = [
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'I love {{collection}} collection too',
      ];
      const slots = [
        'coverage',
        'year',
      ];
      expect(
        templateSlots.getMatchedTemplates(templateSlots.extractRequrements(templates), slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
      ]);
    });
  });

  describe('getMatchedTemplatesExactly', () => {
    it('should find list of all templates which match provides slots', () => {
      const templates = [
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'I love {{collection}} collection too',
      ];
      const slots = [
        'coverage',
        'year',
      ];
      expect(
        templateSlots.getMatchedTemplatesExactly(templateSlots.extractRequrements(templates), slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} {{year}} - great choice!',
      ]);
    });

    it('should match exactly templates which has all needed slots', () => {
      const templates = [
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'I love {{collection}} collection too',
      ];
      const slots = [
        'coverage',
      ];
      expect(
        templateSlots.getMatchedTemplatesExactly(templateSlots.extractRequrements(templates), slots)
      ).to.have.members([
        '{{coverage}} - good place!',
      ]);
    });

    it('should also respect dot notation', () => {
      const templates = [
        'Ok! Lets go with {{creator.title}} band!',
      ];

      const slots = [
        'creator',
      ];

      expect(
        templateSlots.getMatchedTemplatesExactly(templateSlots.extractRequrements(templates), slots)
      ).to.have.members([
        'Ok! Lets go with {{creator.title}} band!',
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
