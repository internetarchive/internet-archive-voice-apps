const {expect} = require('chai');

const {getSuggestionProviderForSlots} = require('../../slots/suggestion-provider');

describe('suggestion provider', () => {
  describe('getSuggestionProviderForSlots', () => {
    it('should return provider to fetch suggestions', () => {
      expect(getSuggestionProviderForSlots([
        'coverage', 'year'
      ])).to.be.ok;
    });

    it('should return provider to fetch suggestions', () => {
      expect(getSuggestionProviderForSlots([
        'some unknown slot'
      ])).to.be.not.ok;
    });
  });
});
