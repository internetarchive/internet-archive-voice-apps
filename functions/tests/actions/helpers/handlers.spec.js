const {expect} = require('chai');
const path = require('path');

const handlers = require('../../../src/actions/helpers/handlers');

describe('actions', () => {
  describe('helpers', () => {
    describe('handlers', () => {
      describe('actionNameByFileName', () => {
        it('should return action name', () => {
          const root = '/foo/bar/';
          const res = handlers.actionNameByFileName(path.join(root, 'next.js'));
          expect(res).to.deep.equal(['next']);
        });
      });
    });
  });
});
