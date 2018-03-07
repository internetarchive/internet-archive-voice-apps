const {expect} = require('chai');
const rebortEscape = require('../../utils/reborn-escape');

describe('utils', () => {
  describe('reborn-escape', () => {
    it('should escape url as usual', () => {
      expect(rebortEscape(
        `01 - (I'm Gettin') Nuttin' F - Ricky Zahnd and The Blue Jeaners.mp3`
      )).to.be.equal(
        `01%20-%20%28I%27m%20Gettin%27%29%20Nuttin%27%20F%20-%20Ricky%20Zahnd%20and%20The%20Blue%20Jeaners.mp3`
      );
    });
  });
});
