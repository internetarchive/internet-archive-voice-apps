const {expect} = require('chai');

const selectors = require('../../../src/configurator/selectors');
const selector = require('../../../src/configurator/selectors/random-selector');

describe('configurator', () => {
  describe('selectors', () => {
    const options = [
      'So twice five miles of fertile ground',
      'With walls and towers were girdled round;',
      'And there were gardens bright with sinuous rills,',
      'Where blossomed many an incense-bearing tree;',
      'And here were forests ancient as the hills,',
      'Enfolding sunny spots of greenery.',
    ];

    describe('index', () => {
      it('should choose random selector and process result on it', () => {
        expect(selectors.find(options)).to.be.oneOf(options);
      });
    });

    describe('random selector', () => {
      it('should choose one options for the set of available', () => {
        expect(selector.find(options)).to.be.oneOf(options);
      });
    });
  });
});
