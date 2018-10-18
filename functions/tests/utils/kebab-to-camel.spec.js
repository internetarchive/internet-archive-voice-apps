const { expect } = require('chai');
const kebabToCamel = require('../../src/utils/kebab-to-camel');

describe('utils', () => {
  describe('kebab to camel', () => {
    it('should convert kebab-style to CamelStyle', () => {
      expect(kebabToCamel('kebab-to-camel')).to.be.equal('KebabToCamel');
    });
  });
});
