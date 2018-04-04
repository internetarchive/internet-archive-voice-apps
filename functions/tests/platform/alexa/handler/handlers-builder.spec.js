const {expect} = require('chai');
const sinon = require('sinon');

const builder = require('../../../../src/platform/alexa/handler/handlers-builder');

describe('platform', () => {
  describe('alexa', () => {
    describe('handlers builder', () => {
      it('should return empty object for empty input', () => {
        const res = builder();
        expect(res).to.be.ok;
        expect(res).to.be.empty;
      });

      it('should capitalize handler names', () => {
        const noInputHandler = sinon.spy();
        const welcomeHandler = sinon.spy();

        const res = builder(new Map([
          ['no-input', noInputHandler],
          ['welcome', welcomeHandler],
        ]));

        expect(res).to.be.ok;
        expect(res).to.have.property('NoInput');
        expect(res).to.have.property('Welcome');
      });
    });
  });
});
