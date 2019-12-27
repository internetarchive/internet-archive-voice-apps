const { expect } = require('chai');

const env = require('../../src/config/env');

describe('config', () => {
  describe('env', () => {
    let orgEnv;

    beforeEach(() => {
      orgEnv = process.env;
      process.env = {
        BOOLEAN_SMALL: 'true',
        BOOLEAN_CAP: 'TRUE',
        BOOLEAN_CAMEL: 'false',

        COMMON_STR: 'hello world',
      };
    });

    afterEach(() => {
      process.env = orgEnv;
    });

    it('should return undefined if we don\'t have such variable', () => {
      const alexaEnv = env('alexa');
      expect(alexaEnv('uknown', 'var')).to.be.undefined;
    });

    it('should return value from process.env', () => {
      const alexaEnv = env('alexa');
      expect(alexaEnv('common', 'str')).to.be.equal('hello world');
    });

    it('should convert true/false to boolean', () => {
      const alexaEnv = env('alexa');
      expect(alexaEnv('boolean', 'small')).to.be.true;
      expect(alexaEnv('boolean', 'cap')).to.be.true;
      expect(alexaEnv('boolean', 'camel')).to.be.false;
    });
  });
});
