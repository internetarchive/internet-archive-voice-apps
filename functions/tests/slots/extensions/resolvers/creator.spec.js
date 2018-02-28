const {expect} = require('chai');

const creator = require('../../../../slots/extensions/resolvers/creator');

describe('slots', () => {
  describe('extensions', () => {
    describe('resolver', () => {
      describe('creator', () => {
        it('should have requirements', () => {
          expect(creator).to.have.property('requirements').to.not.empty;
        });

        describe('handler', () => {
          it('should return promise', () => {
            expect(creator.handler()).to.have.property('then');
          });
        });
      });
    });
  });
});
