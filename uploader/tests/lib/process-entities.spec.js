const {expect} = require('chai');

const clean = require('../../lib/process-entities');

describe('process entities', () => {
  describe('strip brackets', () => {
    it('should drop brackets', () => {
      expect(clean.dropBrackets('Amelia (Vol. 2)')).to.be.equal('Amelia Vol. 2');
    });
  });

  describe('clean', () => {
    it('should clean all entities', () => {
      expect(clean.clean([
        {
          'creator': 'William Shakespeare',
          'title': 'Much Ado About Nothing (version 2)',
        },
      ])).to.be.deep.equal([
        {
          'creator': 'William Shakespeare',
          'title': 'Much Ado About Nothing version 2',
        },
      ]);
    });
  });
});
