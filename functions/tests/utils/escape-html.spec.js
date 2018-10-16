const {expect} = require('chai');

const escapeHTML = require('../../src/utils/escape-html');

describe('utils', () => {
  describe('escape-html', () => {
    it('should escape all special symbols', () => {
      const res = escapeHTML('& < > " \' / ` =');

      expect(res).to.be.equal(
        '&amp; &lt; &gt; &quot; &#39; &#x2F; &#x60; &#x3D;'
      );
    });
  });
});
