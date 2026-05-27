const { expect } = require('chai');
const equal = require('../../src/mathjs/equal');
const includes = require('../../src/mathjs/includes');
const Parser = require('expr-eval').Parser;
const parser = new Parser();

describe('mathjs', () => {
  describe('equal', () => {
    beforeEach(() => {
      parser.functions.equal = equal();
      parser.functions.includes = includes();
    });

    describe('includes', () => {
      it('should be true when collection includes value', () => {
        expect(parser.evaluate('includes([1,2], 1)')).to.be.true;
        expect(parser.evaluate('includes(["a","b"], "a")')).to.be.true;
        expect(parser.evaluate('includes(options, "a")', {
          options: ['a', 'b'],
        })).to.be.true;
      });

      it('should be false when collection includes value', () => {
        expect(parser.evaluate('includes([1,2], 3)')).to.be.false;
        expect(parser.evaluate('includes(["a","b"], "c")')).to.be.false;
      });
    });

    describe('equal', () => {
      it('should "abc" == "abc"', () => {
        expect(parser.evaluate('equal("abc", "abc")')).to.be.true;
      });
      it('should "abc" != "cba"', () => {
        expect(parser.evaluate('equal("abc", "cba")')).to.be.false;
      });
    });
  });
});
