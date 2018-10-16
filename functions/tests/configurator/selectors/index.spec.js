const {expect} = require('chai');

const selectors = require('../../../src/configurator/selectors');

describe('configurator', () => {
  describe('selectors', () => {
    describe('index', () => {
      it(`should return passed value if it isn't array`, () => {
        expect(selectors.find('brave new world')).to.be.equal('brave new world');
      });
    });
  });
});
