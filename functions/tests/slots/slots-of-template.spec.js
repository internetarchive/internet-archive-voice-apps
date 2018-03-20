const {expect} = require('chai');
const rewire = require('rewire');

const templateSlots = rewire('../../src/slots/slots-of-template');

describe('slots', () => {
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
});
