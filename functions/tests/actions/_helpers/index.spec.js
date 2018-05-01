const {expect} = require('chai');
const path = require('path');
const rewire = require('rewire');

const handlers = rewire('../../../src/actions/_helpers');

describe('actions', () => {
  describe('helpers', () => {
    describe('handlers', () => {
      describe('actionNameByFileName', () => {
        let root;
        beforeEach(() => {
          root = '/foo/bar/';
          handlers.__set__('__dirname', path.join(root, 'helpers'));
        });

        it('should return action name', () => {
          const res = handlers.actionNameByFileName(path.join(root, 'next.js'));
          expect(res).to.deep.equal(['next']);
        });

        it('should return action name with path from root', () => {
          const res = handlers.actionNameByFileName(path.join(root, 'playback', 'next.js'));
          expect(res).to.deep.equal(['playback', 'next']);
        });
      });
    });
  });
});
