const {expect} = require('chai');

const selector = require('../../src/configurator/random-selector');

describe('parser', () => {
  describe('random options', () => {
    it('should choose one options for the set of available', () => {
      const options = [
        'So twice five miles of fertile ground',
        'With walls and towers were girdled round;',
        'And there were gardens bright with sinuous rills,',
        'Where blossomed many an incense-bearing tree;',
        'And here were forests ancient as the hills,',
        'Enfolding sunny spots of greenery.',
      ];
      expect(selector.process(options)).to.be.oneOf(options);
    });
  });
});
