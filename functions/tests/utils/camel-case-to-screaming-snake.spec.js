const { expect } = require('chai');
const camelToSnake = require('../../src/utils/camel-case-to-screaming-snake');

describe('utils', () => {
  describe('camel case to screaming snake case', () => {
    it('should convert camelCase to SCREAMING_SNAKE_CASE', () => {
      expect(camelToSnake('camelToSnake')).to.be.equal('CAMEL_TO_SNAKE');
    });
  });
});
