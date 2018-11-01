const { expect } = require('chai');

const { getLastPhrase, getLastReprompt, getReprompt, savePhrase } = require('../../src/state/dialog');

const mockApp = require('../_utils/mocking/platforms/app');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = mockApp({
      getData: {
        somethingElse: 'hello world',
      },
    });
  });

  describe('dialog', () => {
    describe('savePhrase', () => {
      it('should store phrase and we could pick up it', () => {
        savePhrase(app, { speech: 'Hi there!' });
        expect(getLastPhrase(app)).to.have.property('speech').to.be.equal('Hi there!');
      });

      it('should preserve previous reprompt if we have not pass new one', () => {
        savePhrase(app, {
          speech: 'speech 1',
          reprompt: 'reprompt 1',
        });

        savePhrase(app, {
          speech: 'speech 2',
        });

        expect(getLastPhrase(app)).to.have.property('reprompt').to.be.equal('reprompt 1');
      });
    });

    describe('getLastPhrase', () => {
      it('should return undefined if we have not stored phrase before', () => {
        expect(getLastPhrase(app)).to.be.undefined;
      });
    });

    describe('getLastReprompt', () => {
      it('should return reprompt', () => {
        savePhrase(app, { reprompt: 'Sorry! Repeat The number please!' });
        expect(getLastReprompt(app)).to.be.equal('Sorry! Repeat The number please!');
      });
    });

    describe('getReprompt', () => {
      it('should return reprompt object with speech, suggestions and upcoming reprompt speech', () => {
        savePhrase(app, {
          speech: 'What is your number?',
          reprompt: 'Sorry! Repeat The number please!',
          suggestions: ['1', '2', '3'],
        });

        expect(getReprompt(app))
          .to.be.deep.equal({
            speech: 'Sorry! Repeat The number please!',
            reprompt: 'Sorry! Repeat The number please!',
            suggestions: ['1', '2', '3'],
          });
      });
    });
  });
});
