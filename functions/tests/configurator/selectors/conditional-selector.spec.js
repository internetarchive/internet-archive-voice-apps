const {expect} = require('chai');

const selector = require('../../../src/configurator/selectors/condition-selector');

describe('configurator', () => {
  describe('random selector', () => {
    it('should choose one options for the set of available', () => {
      const options = [
        {
          name: 'one',
          condition: 'value == 1',
        },
        {
          name: 'two',
          condition: '1 < value and value < 3',
        },
        {
          name: 'three',
          condition: 'value == 3',
        },
      ];
      const context = {
        value: 2,
      };
      expect(selector.process(options, context)).to.be.deep.equal(options[1]);
    });
  });
});
