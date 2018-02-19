const {expect} = require('chai');
const {getLastPhrase, getLastReprompt, savePhrase} = require('../../state/context');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = {data: {}};
  });

  describe('context', () => {
    describe('savePhrase', () => {
      it('should store phrase and we could pick up it', () => {
        app.data.somethingElse = 'hello world';
        savePhrase(app, 'Hi there!');
        expect(app.data).to.have.property('somethingElse', 'hello world');
        expect(getLastPhrase(app)).to.be.equal('Hi there!');
      });
    });

    describe('getLastPhrase', () => {
      it('should return undefined if we have not stored phrase before', () => {
        expect(getLastPhrase(app)).to.be.undefined;
      });
    });

    describe('getLastReprompt', () => {
      it('should return reprompt', () => {
        savePhrase(app, {reprompt: 'Sorry! Repeat The number please!'});
        expect(getLastReprompt(app)).to.be.equal('Sorry! Repeat The number please!');
      });
    });
  });
});
