const {expect} = require('chai');

const process = require('../../lib/process-entities');

describe('process entities', () => {
  describe('strip brackets', () => {
    it('should drop brackets', () => {
      expect(process.dropBrackets('Amelia (Vol. 2)')).to.be.equal('Amelia Vol. 2');
    });
  });

  describe('clean', () => {
    it('should clean all entities', () => {
      expect(process.clean([
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

  describe('sortEntities', () => {
    it('should sort entities', () => {
      expect(process.sortEntities([
        {
          "title": "Much Ado About Nothing (version 2)",
        },
        {
          "title": "Satires of Circumstance, Lyrics and Reveries, with Miscellaneous Pieces",
        },
        {
          "title": "I Remember, I Remember",
        }
      ])).to.be.deep.equal([
        {
          "title": "I Remember, I Remember",
        },
        {
          "title": "Much Ado About Nothing (version 2)",
        },
        {
          "title": "Satires of Circumstance, Lyrics and Reveries, with Miscellaneous Pieces",
        }
      ]);
    });
  });
});
