const {expect} = require('chai');

const ask = require('../../../../src/platform/assistant/response/ask');
const assistantMock = require('../../../_utils/mocking/platforms/assistant');

describe('platform', () => {
  describe('assistant', () => {
    describe('response', () => {
      describe('ask', () => {
        let assistant;

        beforeEach(() => {
          assistant = assistantMock();
        });

        it('should wrap speech to <speak> tag', () => {
          ask(assistant)({speech: 'hello world!'});
          expect(assistant.ask).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
        });

        it('should wrap speech with suggestions to <speak> tag', () => {
          ask(assistant)({
            speech: 'hello world!',
            suggestions: ['world one', 'world two'],
          });
          expect(assistant.addSimpleResponse).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
        });
      });
    });
  });
});
