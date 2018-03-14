const {expect} = require('chai');

const {getSuggestionProviderForSlots} = require('../../../src/extensions/suggestions');

describe('slots', () => {
  describe('suggestions', () => {
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
});
