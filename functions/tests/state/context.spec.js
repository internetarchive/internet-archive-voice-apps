const {expect} = require('chai');
const {getLastPhrase, savePhrase} = require('../../state/context');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = {data: {}};
  });

  describe('context', () => {
    describe('savePhrase and getLastPhrase', () => {
      it('should store phrase and we could pick up it', () => {
        app.data.somethingElse = 'hello world';
        savePhrase(app, 'Hi there!');
        expect(app.data).to.have.property('somethingElse', 'hello world');
        expect(getLastPhrase(app)).to.be.equal('Hi there!');
      });

      it('should return undefined if we have not stored phrase before', () => {
        expect(getLastPhrase(app)).to.be.undefined;
      });
    });
  });
});
