const {expect} = require('chai');

const clean = require('../../lib/clean-entities');

describe('clean entities', () => {
  describe('strip brackets', () => {
    it('should drop brackets', () => {
      expect(clean.dropBrackets('Amelia (Vol. 2)')).to.be.equal('Amelia Vol. 2');
    });
  });

  describe('cleanEntities', () => {
    it('should clean all entities', () => {
      expect(clean.cleanEntities([
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
