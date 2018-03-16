const {expect} = require('chai');
const path = require('path');

const builder = require('../../src/extensions/builder');

describe('extensions', () => {
  describe('builder', () => {
    let extensions;

    beforeEach(() => {
      extensions = builder.build({root: path.join(__dirname, 'fixtures')});
    });

    describe('getExtension', () => {
      it('should return extension by name', () => {
        expect(extensions.getByName('apple')).to.be.ok;
        expect(extensions.getByName('not-existing')).to.be.null;
      });
    });
  });
});
