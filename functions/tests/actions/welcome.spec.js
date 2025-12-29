const { expect } = require('chai');
const rewire = require('rewire');

const welcome = rewire('../../src/actions/welcome');
const playlist = require('../../src/state/playlist');
const query = require('../../src/state/query');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;
  beforeEach(() => {
    dialog = mockDialog();
    welcome.__set__('dialog', dialog);
  });

  describe('welcome', () => {
    it('should greet user', () => {
      const app = mockApp();
      welcome.handler(app);
      expect(dialog.ask).have.been.calledOnce;
      expect(dialog.ask.args[0][1]).to.have.property('reprompt');
      expect(dialog.ask.args[0][1]).to.have.property('speech')
        .to.include('Welcome to music at the Internet Archive.');
      expect(dialog.ask.args[0][1]).to.have.property('suggestions')
        .with.members(['Live Concerts', 'Unlocked Recordings', 'Christmas music']);
    });

    it('should reprompt with speech', () => {
      const app = mockApp();
      welcome.handler(app);
      expect(dialog.ask.args[0][1]).to.have.property('reprompt')
        .to.include('Want to listen to')
        .and.include('Live');
    });

    it('should reset query slots', () => {
      const app = mockApp();
      query.setSlot(app, 'collection', 'etree');
      query.setSlot(app, 'creator', 'The Grateful Dead');
      welcome.handler(app);
      expect(query.hasSlot(app, 'creator')).to.be.false;
      expect(query.hasSlot(app, 'collection')).to.be.false;
    });

    it('should reset playlist', () => {
      const app = mockApp();
      playlist.create(app, ['item-1', 'item-2']);
      welcome.handler(app);
      expect(playlist.isEmpty(app)).to.be.true;
    });
  });
});
