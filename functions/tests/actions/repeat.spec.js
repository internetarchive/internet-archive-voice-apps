const {expect} = require('chai');
const rewire = require('rewire');
const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const action = rewire('../../actions/repeat');

describe('actions', () => {
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('repeat handler', () => {
    it('should ask user', () => {
      let app = mockApp();
      const message = 'Which direction do you go?';
      const reprompt = 'Where are you go?';
      const suggestions = ['west', 'east', 'north', 'south'];
      app.data.dialog = {
        lastPhrase: {
          message, reprompt, suggestions,
        },
      };
      action.handler(app);
      expect(dialog.ask).to.be.calledWith(app, message, reprompt, suggestions);
    });
  });
});
