const {expect} = require('chai');
const base64 = require('../../../uploader/utils/base64');

describe('uploader', () => {
  describe('utils', () => {
    describe('base64', () => {
      describe('base64Encode', () => {
        it('should be defined', () => {
          expect(base64.base64Encode).to.be.ok;
        });
      });
      describe('base64Decode', () => {
        it('should be defined', () => {
          expect(base64.base64Decode).to.be.ok;
        });
      });
    });
  });
});
