const {expect} = require('chai');

const {
  extractRequrements,
  getListOfRequiredSlots,
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
} = require('../../slots/slots-of-template');

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

      const res = extractRequrements(templates);
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

      const res = extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['creator']);
    });

    it('should fetch requirements from resolvers', () => {
      const templates = [
        'Ok! Lets go with {{__resolvers.creator.title}} band!',
      ];

      const res = extractRequrements(templates);
      expect(res).to.have.length(templates.length);
      expect(res[0]).to.have.property('requirements')
        .to.have.members(['creatorId']);
    });
  });

  describe('getListOfRequiredSlots', () => {
    it('should return list of names of needed slots', () => {
      expect(
        getListOfRequiredSlots('{{coverage}} {{year}} - great choice!')
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
        getMatchedTemplates(extractRequrements(templates), slots)
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
        getMatchedTemplatesExactly(extractRequrements(templates), slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} {{year}} - great choice!',
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
        getMatchedTemplatesExactly(extractRequrements(templates), slots)
      ).to.have.members([
        'Ok! Lets go with {{creator.title}} band!',
      ]);
    });
  });

  describe('getPromptsForSlots', () => {
    it('should return prompts with maximum intersection', () => {
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
      const res = getPromptsForSlots(prompts, slots);
      expect(res.prompts).to.includes(
        'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?'
      )
    });
  });
});