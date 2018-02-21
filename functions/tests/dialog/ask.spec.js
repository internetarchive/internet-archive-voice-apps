const {expect} = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');
const ask = rewire('../../dialog/ask');
const mockApp = require('../_utils/mocking/app');

describe('dialog', () => {

  let savePhrase;

  beforeEach(() => {
    savePhrase = sinon.spy();
    ask.__set__('savePhrase', savePhrase)
  });

  describe('ask', () => {
    it('should construct response', () => {
      const app = mockApp();

      const message = 'hello world!';
      const suggestions = ['one', 'two'];
      const reprompt = 'Hello!?';

      ask(app, message, reprompt, suggestions);

      expect(app.ask).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addSimpleResponse).to.be.calledWith(message);
      expect(app.addSuggestions).to.be.calledWith(suggestions);
      expect(savePhrase).to.be.calledOnce;
    });
  });
});
