const {expect} = require('chai');

const selectors = require('../../../src/configurator/selectors');
const selector = require('../../../src/configurator/selectors/template-selector');

describe('configurator', () => {
  describe('selectors', () => {
    const options = [
      '{{coverage}} - good place!',
      '{{coverage}} {{year}} - great choice!',
      '{{year}} - it was excellent year!',
      'Ok! Lets go with {{creator}} band!',
    ];

    describe('index', () => {
      xit('should choose template selector and process result on it', () => {
        expect(selectors.find(options, {
          prioritySlots: ['coverage', 'year'],
        })).to.be.equal(options[1]);
      });
    });

    describe('template selector', () => {
      it('should choose matched by keys', () => {
        expect(selector.find(options, {
          prioritySlots: ['coverage', 'year'],
        })).to.be.equal(options[1]);
      });
    });
  });
});
