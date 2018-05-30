const {expect} = require('chai');
const base64 = require('../../../uploader/utils/base64');
const fs = require('fs');
const base64Str = 'UEsDBBQAAAAAAJBqvEwAAAAAAAAAAAAAAAANACAAc2FtcGxlX2FnZW50L1VUDQAHyLQLW+K0C1vctAtbdXgLAAEE6AMAAAToAwAAUEsBAhQDFAAAAAAAkGq8TAAAAAAAAAAAAAAAAA0AIAAAAAAAAAAAAO1BAAAAAHNhbXBsZV9hZ2VudC9VVA0AB8i0C1vitAtb3LQLW3V4CwABBOgDAAAE6AMAAFBLBQYAAAAAAQABAFsAAABLAAAAAAA=';

describe('uploader', () => {
  describe('utils', () => {
    describe('base64', () => {
      describe('base64Encode', () => {
        it('should be defined', () => {
          expect(base64.base64Encode).to.be.ok;
        });

        it('should return encoded string', () => {
          base64.base64Encode('./tests/uploader/utils/fixtures/sample_agent.zip')
            .then(value => {
              expect(value).to.be.a('string');
            });
        });
      });

      describe('base64Decode', () => {
        it('should be defined', () => {
          expect(base64.base64Decode).to.be.ok;
        });

        it('should return success', () => {
          base64.base64Decode(base64Str, './tests/uploader/utils/fixtures/sample_agent.zip')
            .then(value => {
              expect(value).to.be.eql('successe');
            });
        });
      });
    });
  });
});
