const {expect} = require('chai');

const builder = require('../../../../src/platform/alexa/handler/handlers-builder');

describe('platform', () => {
  describe('alexa', () => {
    describe('handlers builder', () => {
      it('should return empty object for empty input', () => {
        const res = builder();
        expect(res).to.be.ok;
        expect(res).to.be.empty;
      });
    });
  });
});
