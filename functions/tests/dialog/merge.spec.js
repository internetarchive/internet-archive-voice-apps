const { expect } = require('chai');

const merge = require('../../src/dialog/merge');

describe('dialog', () => {
  describe('merge', () => {
    it('should concat speech together', () => {
      const res = merge({
        speech: 'Picture a bright blue ball, just spinning, spinnin free',
      }, {
        speech: 'Dizzy with eternity.',
      });

      expect(res).to.be.deep.equal({
        speech: [
          'Picture a bright blue ball, just spinning, spinnin free',
          'Dizzy with eternity.',
        ],
      });
    });

    it('should concat suggestions together', () => {
      const res = merge({
        suggestions: ['one', 'two'],
      }, {
        suggestions: ['three', 'four'],
      });

      expect(res).to.be.deep.equal({
        suggestions: [
          'one',
          'two',
          'three',
          'four',
        ],
      });
    });

    it('should drop suggestions duplications', () => {
      const res = merge({
        suggestions: ['one', 'two', 'three'],
      }, {
        suggestions: ['two', 'three', 'four'],
      });

      expect(res).to.be.deep.equal({
        suggestions: [
          'one',
          'two',
          'three',
          'four',
        ],
      });
    });

    it('should left the last reprompt', () => {
      const res = merge({
        reprompt: 'Which artist?'
      }, {
        reprompt: 'Which album?'
      });

      expect(res).to.be.deep.equal({
        reprompt: 'Which album?'
      });
    });
  });
});
