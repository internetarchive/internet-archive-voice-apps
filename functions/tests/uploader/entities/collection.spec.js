const {expect} = require('chai');

const collection = require('../../../uploader/entities/collection');

describe('uploader', () => {
  describe('entities', () => {
    describe('collection', () => {
      describe('uploadCollection', () => {
        it('should be defined', () => {
          expect(collection.uploadCollection).to.be.ok;
        });
      });
    });
  });
});
