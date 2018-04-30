const {expect} = require('chai');
const path = require('path');

const builder = require('../../src/extensions/builder');

const apple = require('./fixtures/apple');
const banana = require('./fixtures/banana');

describe('extensions', () => {
  describe('builder', () => {
    let extensions;

    beforeEach(() => {
      extensions = builder.build({root: path.join(__dirname, 'fixtures')});
    });

    describe('all', () => {
      it('should return list of all extensions', () => {
        const items = extensions.all();
        expect(items).to.be.length(2);
        expect(items[0]).to.have.property('ext', apple);
        expect(items[0]).to.have.property('filename')
          .which.includes('apple.js');
        expect(items[1]).to.have.property('ext', banana);
        expect(items[1]).to.have.property('filename')
          .which.includes('banana.js');
      });
    });

    describe('find', () => {
      it('should find the first extension which return true on handler', () => {
        expect(extensions.find((ex) => ex.name === 'apple')).to.be.equal(require('./fixtures/apple'));
      });

      it(`shouldn't hit the index`, () => {
        expect(extensions.find((ex) => ex.name === 'index')).to.be.null;
      });
    });

    describe('getExtension', () => {
      it('should return extension by name', () => {
        expect(extensions.getByName('apple')).to.be.ok;
        expect(extensions.getByName('not-existing')).to.be.null;
      });
    });

    describe('has', () => {
      it('should return true if we have this extension', () => {
        expect(extensions.has('apple')).to.be.ok;
      });

      it('should return false if we have this extension', () => {
        expect(extensions.has('apple')).to.be.ok;
      });
    });
  });
});
