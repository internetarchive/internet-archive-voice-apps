const {expect} = require('chai');
const accessToken = require('../../../uploader/utils/get-access-token');

describe('uploader', () => {
  describe('utils', () => {
    describe('get-access-token', () => {
      describe('getBasicHeaderRequest', () => {
        it('should be defined', () => {
          expect(accessToken.getBasicHeaderRequest).to.be.ok;
        });
      });
      describe('getAccessToken', () => {
        it('should be defined', () => {
          expect(accessToken.getAccessToken).to.be.ok;
        });
      });
    });
  });
});
