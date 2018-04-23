const {expect} = require('chai');

const genres = require('../../../uploader/entities/genres');

describe('uploader', () => {
  describe('entities', () => {
    describe('genres', () => {
      describe('uploadGenres', () => {
        it('should be defined', () => {
          expect(genres.uploadGenres).to.be.ok;
        });
      });
    });
  });
});
