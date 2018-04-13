const {expect} = require('chai');
const rewire = require('rewire');

const resumeIntent = rewire('../../src/actions/resume-intent');
const strings = require('../../src/strings');

const mockDialog = require('../_utils/mocking/dialog/ask');
const mockApp = require('../_utils/mocking/platforms/app');

describe('actions', () => {
  describe('resume-intent', () => {
    let app;
    let dialog;

    beforeEach(() => {
      app = mockApp({
        getData: {
          dialog: {
            lastPhrase: {
              reprompt: 'What is the album?',
              suggestions: ['Grateful Dead'],
            }
          }
        }
      });

      dialog = mockDialog();

      resumeIntent.__set__('dialog', dialog);
    });

    it('should reprompt when resume but nothing to resume', () => {
      return resumeIntent.handler(app)
        .then(() => {
          expect(dialog.ask).to.have.been.called;
          expect(dialog.ask.args[0][0]).to.equal(app);
          expect(dialog.ask.args[0][1]).to.have.property('speech')
            .with.members([
              strings.intents.resume.empty.speech,
              'What is the album?',
            ]);
          expect(dialog.ask.args[0][1]).to.have.property('suggestions')
            .with.members([
              'Grateful Dead',
            ]);
          expect(dialog.ask.args[0][1]).to.have.property('reprompt')
            .be.equal('What is the album?');
        });
    });
  });
});
