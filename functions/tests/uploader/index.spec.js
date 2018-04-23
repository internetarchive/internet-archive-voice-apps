const {expect} = require('chai');
const index = require('../../uploader');

describe('uploader', () => {
  describe('index', () => {
    describe('handle', () => {
      it('should be defined', () => {
        expect(index.handle).to.be.ok;
      });
    });
    describe('execute', () => {
      it('should be defined', () => {
        expect(index.execute).to.be.ok;
      });
      it('should reject for unknown command', () => {
        const condition = index.execute(`anything`, `anything`);
        expect(condition).to.have.string(`That was not a valid command`);
      });
    });
  });
});
