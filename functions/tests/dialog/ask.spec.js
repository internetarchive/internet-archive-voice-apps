const {expect} = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');

const ask = rewire('../../src/dialog/ask');

const mockApp = require('../_utils/mocking/platforms/assistant');

describe('dialog', () => {
  let savePhrase;
  let Suggestions;

  beforeEach(() => {
    savePhrase = sinon.spy();
    Suggestions = sinon.spy();
    ask.__set__('savePhrase', savePhrase);
    ask.__set__('Suggestions', Suggestions);
  });

  describe('ask', () => {
    it('should construct response', () => {
      const app = mockApp();

      const speech = 'hello world!';
      const suggestions = ['one', 'two'];
      const reprompt = 'Hello!?';

      ask(app, {speech, reprompt, suggestions});

      expect(app.ask).to.be.calledOnce;
      expect(app.ask.args[0][1]).to.be.equal(speech);
      expect(Suggestions).to.be.calledWith(suggestions);
      expect(savePhrase).to.be.calledOnce;
    });
  });
});
