const {expect} = require('chai');
const mathjsExtensions = require('../../src/mathjs');

let math = require('mathjs');

describe('mathjs', () => {
  // let math;

  beforeEach(() => {
    // TODO: for clear test we should have
    // mathjsExtensions.unpatch();
    mathjsExtensions.patch();
  });

  describe('includes', () => {
    it('should be true when collection includes value', () => {
      expect(math.eval('includes([1,2], 1)')).to.be.true;
      expect(math.eval('includes(["a","b"], "a")')).to.be.true;
      expect(math.eval('includes(options, "a")', {
        options: ['a', 'b'],
      })).to.be.true;
    });

    it('should be false when collection includes value', () => {
      expect(math.eval('includes([1,2], 3)')).to.be.false;
      expect(math.eval('includes(["a","b"], "c")')).to.be.false;
    });
  });
});
