const {expect} = require('chai');
const sinon = require('sinon');

const builder = require('../../../../src/platform/alexa/handler/handlers-builder');
const {App} = require('../../../../src/platform/alexa/app');

describe('platform', () => {
  describe('alexa', () => {
    describe('handlers builder', () => {
      it('should return empty object for empty input', () => {
        const res = builder();
        expect(res).to.be.ok;
        expect(res).to.be.empty;
      });

      it('should capitalize handler names', () => {
        const res = builder(new Map([
          ['no-input', () => {}],
          ['welcome', () => {}],
        ]));

        expect(res).to.be.ok;
        expect(res).to.have.property('NoInput');
        expect(res).to.have.property('Welcome');
      });

      it('should pass alexa app as 1st argument to intent handler', () => {
        const alexa = {};
        const noInputHandler = sinon.spy();
        const welcomeHandler = sinon.spy();

        const res = builder(new Map([
          ['no-input', noInputHandler],
          ['welcome', welcomeHandler],
        ]));

        const wrappedNoInputHandler = res['NoInput'];
        wrappedNoInputHandler.call(alexa);
        expect(noInputHandler).to.have.been.called;
        expect(noInputHandler.args[0][0]).to.be.an.instanceof(App);
      });
    });
  });
});
