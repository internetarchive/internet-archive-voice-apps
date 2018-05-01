const {expect} = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');

const ask = rewire('../../src/dialog/ask');

const mockApp = require('../_utils/mocking/platforms/app');

describe('dialog', () => {
  let savePhrase;

  beforeEach(() => {
    savePhrase = sinon.spy();
    ask.__set__('savePhrase', savePhrase);
  });

  describe('ask', () => {
    let app;

    beforeEach(() => {
      app = mockApp();
    });

    it('should construct response', () => {
      const speech = 'hello world!';
      const suggestions = ['one', 'two'];
      const reprompt = 'Hello!?';

      ask(app, {speech, reprompt, suggestions});

      expect(app.response).to.be.calledOnce;
      expect(app.response.args[0][0]).to.be.deep.equal({reprompt, speech, suggestions});
      expect(savePhrase).to.be.calledOnce;
    });

    it('should escape response', () => {
      const speech = `
      <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
                       clipBegin="4.5s"
                       clipEnd="5.5s"
                       soundLevel="10db">
          <desc>Track - "Last Night Blues of Joe Liggins & His Honeydrippers,Joe Liggins,"Little" Willie Jackson,James Jackson,Eddie Davis,"Peppy" Prince,Frank Palsey 1947</desc>
      </audio>
      `;
      const suggestions = ['one', 'two'];
      const reprompt = 'Hello!?';

      ask(app, {speech, reprompt, suggestions});

      expect(app.response.args[0][0])
        .to.have.property('speech')
        .to.not.include('"');
    });
  });
});
