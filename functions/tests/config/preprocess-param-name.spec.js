const {expect} = require('chai');
const preprocess = require('../../src/config/group-param-to-env-variable-name');

describe('config', () => {
  describe('env', () => {
    describe('group-param-to-env-variable-name', () => {
      it('should preprocess name', () => {
        expect(preprocess('group', 'name')).to.equal('GROUP_NAME');
      });
    });
  });
});
