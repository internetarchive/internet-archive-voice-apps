const {expect} = require('chai');

const camelToKebab = require('../../src/utils/camel-to-kebab');

describe('utils', () => {
  describe('camel to kebab', () => {
    it('should convert string to string', () => {
      expect(camelToKebab('String')).to.be.equal('string');
    });

    it('should convert CamelCase to kebab-style', () => {
      expect(camelToKebab('HelloWorld')).to.be.equal('hello-world');
    });

    it('should ignore _ (underscore)', () => {
      expect(camelToKebab('Hello_World')).to.be.equal('hello_world');
    });
  });
});
