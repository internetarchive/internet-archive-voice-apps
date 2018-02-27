const {expect} = require('chai');

const {
  getListOfRequiredSlots,
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
} = require('../../slots/slots-of-template');

describe('slots', () => {
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
        getMatchedTemplates(templates, slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
      ])
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
        getMatchedTemplatesExactly(templates, slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} {{year}} - great choice!',
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