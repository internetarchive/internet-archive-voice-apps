const {expect} = require('chai');

const alexaMock = require('../../../_utils/mocking/platforms/alexa');
const ask = require('../../../../src/platform/alexa/response/ask');

describe('platform', () => {
  describe('assistant', () => {
    describe('response', () => {
      let alexa;

      beforeEach(() => {
        alexa = alexaMock();
      });

      it('should speak speech argument', () => {
        ask(alexa)({speech: 'hello world!'});
        expect(alexa.response.speak).to.have.been
          .calledWith('hello world!');
      });
    });
  });
});
 