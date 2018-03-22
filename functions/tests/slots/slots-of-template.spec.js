const {expect} = require('chai');
const rewire = require('rewire');

const templateSlots = rewire('../../src/slots/slots-of-template');

describe('slots', () => {
  describe('getPromptsForSlots', () => {
    it('should return prompts with maximum true positive', () => {
      const prompts = [{
        confirm: [
          'collection'
        ],
        speech: [
          'Would you like to listen to music from our collections of 78s or Live Concerts?',
        ],
      }, {
        confirm: [
          'creator'
        ],
        speech: [
          'What artist would you like to listen to, e.g. the Grateful Dead, the Ditty Bops, or the cowboy junkies?',
        ],
      }, {
        confirm: [
          'coverage',
        ],
        speech: [
          'Which location?',
        ],
      }, {
        confirm: [
          'coverage',
          'year',
        ],
        speech: [
          'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?',
        ],
      }];
      const slots = [
        'coverage',
        'year',
      ];
      const res = templateSlots.getPromptsForSlots(prompts, slots);
      expect(res.speech).to.includes(
        'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?'
      );
    });

    it('should return prompts with minimum false positive', () => {
      const prompts = [{
        confirm: [
          'collection'
        ],
        speech: [
          'Would you like to listen to music from our collections of 78s or Live Concerts?',
        ],
      }, {
        confirm: [
          'creator'
        ],
        speech: [
          'What artist would you like to listen to, e.g. the Grateful Dead, the Ditty Bops, or the cowboy junkies?',
        ],
      }, {
        confirm: [
          'coverage',
        ],
        speech: [
          'Which location?',
        ],
      }, {
        confirm: [
          'coverage',
          'year',
        ],
        speech: [
          'Do you have a specific city and year in mind, like Washington 1973, or would you like me to play something randomly?',
        ],
      }, {
        confirm: [
          'year',
        ],
        speech: [
          'Which year?',
        ],
      }];
      const slots = [
        'year',
      ];
      const res = templateSlots.getPromptsForSlots(prompts, slots);
      expect(res.speech).to.includes(
        'Which year?'
      );
    });
  });
});
