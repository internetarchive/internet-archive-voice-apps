const {expect} = require('chai');
const rewire = require('rewire');
const mockApp = require('../_utils/mocking/app');
const mockDialog = require('../_utils/mocking/dialog');
const action = rewire('../../actions/no-input');
const strings = require('../../strings').intents.noInput;
const {storeAction} = require('../../state/repetition');

describe('actions', () => {
  let dialog;
  let app;
  const message = 'Which direction do you go?';
  const reprompt = 'Where are you go?';
  const suggestions = ['west', 'east', 'north', 'south'];

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);

    app = mockApp();
    app.data.dialog = {
      lastPhrase: {
        message, reprompt, suggestions,
      },
    };
  });

  describe('no input handler', () => {
    it('should 1st time give suggestion', () => {
      action.handler(app);
      expect(dialog.ask).to.be.calledOnce;
      expect(dialog.ask).to.be.calledWith(
        app,
        strings.first,
        suggestions
      );
    });

    it('should 2nd time reprompt', () => {
      storeAction(app, 'no-input');
      action.handler(app);
      expect(dialog.ask).to.be.calledWith(
        app,
        strings.reprompt.replace('${reprompt}', reprompt),
        suggestions
      );
    });

    it('should 3rd time fallback', () => {
      storeAction(app, 'no-input');
      storeAction(app, 'no-input');
      action.handler(app);
      expect(dialog.tell).to.be.calledWith(
        app,
        strings.fallback
      );
    });
  });
});
