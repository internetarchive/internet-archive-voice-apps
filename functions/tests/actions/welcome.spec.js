const {expect} = require('chai');
const rewire = require('rewire');

const welcome = rewire('../../src/actions/welcome');

const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = mockDialog();
    welcome.__set__('dialog', dialog);
  });

  describe('welcome', () => {
    it('should greet user', () => {
      let app = mockApp();
      welcome.handler(app);
      expect(dialog.ask).have.been.calledOnce;
      expect(dialog.ask.args[0][1]).to.have.property('reprompt');
      expect(dialog.ask.args[0][1]).to.have.property('speech')
        .to.equal('Welcome to music at the Internet Archive. Would you like to listen to music from our collections of <emphasis level="moderate">78s</emphasis> or <emphasis level="moderate">Live Concerts</emphasis>?');
      expect(dialog.ask.args[0][1]).to.have.property('suggestions')
        .with.members(['78s', 'Live Concerts']);
    });

    it('should reprompt with speech', () => {
      let app = mockApp();
      welcome.handler(app);
      expect(dialog.ask.args[0][1]).to.have.property('reprompt')
        .to.include('Would you like to listen to music from our collections of <emphasis level="moderate">78s</emphasis> or <emphasis level="moderate">Live Concerts</emphasis>?');
    });
  });
});
