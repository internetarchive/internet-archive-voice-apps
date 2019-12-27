const { expect } = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/repeat');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  let dialog;

  beforeEach(() => {
    dialog = mockDialog();
    action.__set__('dialog', dialog);
  });

  describe('repeat handler', () => {
    it('should ask user', () => {
      const speech = 'Which direction do you go?';
      const reprompt = 'Where are you go?';
      const suggestions = ['west', 'east', 'north', 'south'];
      const app = mockApp({
        getData: {
          dialog: {
            lastPhrase: {
              speech, reprompt, suggestions,
            },
          },
        },
      });
      action.handler(app);
      expect(dialog.ask).to.be.called;
      expect(dialog.ask.args[0][1]).to.be.deep.equal({ speech, reprompt, suggestions });
    });
  });
});
