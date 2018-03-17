const {expect} = require('chai');

const selectors = require('../../../src/configurator/selectors');
const selector = require('../../../src/configurator/selectors/condition-selector');

describe('configurator', () => {
  describe('selectors', () => {
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

    const optionsWithDefault = [
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
      {
        name: 'many',
      }
    ];

    const context = {
      value: 2,
    };

    describe('index', () => {
      it('should choose random selector and process result on it', () => {
        expect(selectors.find(options, context)).to.be.deep.equal(options[1]);
      });

      it('should choose random selector for options with default option', () => {
        expect(selectors.find(optionsWithDefault, {
          value: 100,
        })).to.be.deep.equal(optionsWithDefault[3]);
      });
    });

    describe('conditional selector', () => {
      it('should choose one options for the set of available', () => {
        expect(selector.find(options, context)).to.be.deep.equal(options[1]);
      });

      it('should choose default option if the result is not valid', () => {
        expect(selector.find(optionsWithDefault, {
          value: 100,
        })).to.be.deep.equal(optionsWithDefault[3]);
      });
    });
  });
});
