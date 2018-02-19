const {expect} = require('chai');
const sinon = require('sinon');
const ask = require('../../dialog/ask');

describe('dialog', () => {
  describe('ask', () => {
    it('should construct response', () => {
      const app = {};
      app.ask = sinon.stub().returns(app);
      app.buildRichResponse = sinon.stub().returns(app);
      app.addSimpleResponse = sinon.stub().returns(app);
      app.addSuggestions = sinon.stub().returns(app);
      app.data = {};

      const message = 'hello world!';
      const suggestions = ['one', 'two'];

      ask(app, message, suggestions);

      expect(app.ask).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addSimpleResponse).to.be.calledWith(message);
      expect(app.addSuggestions).to.be.calledWith(suggestions);
      expect(app.data.context.dialog).to.have.property('message', message);
      expect(app.data.context.dialog).to.have.property('suggestions', suggestions);
    });
  });
});
