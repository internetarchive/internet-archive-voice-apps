const { expect } = require('chai');

const jsonify = require('../../src/utils/jsonify');

describe('utils', () => {
  describe('jsonify', () => {
    it('should strip NaN', () => {
      const res = jsonify({
        value: NaN,
      });

      expect(res).to.be.deep.equal({
        value: null,
      });
    });
  });
});
