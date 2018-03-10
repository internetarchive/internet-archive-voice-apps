const {expect} = require('chai');
const rewire = require('rewire');

const entities = rewire('../../../uploader/entities/entities');

describe('uploader', () => {
  describe('entities', () => {
    describe('entities', () => {
      describe('postEntitiesToDF', () => {
        it('should be defined', () => {
          expect(entities.postEntitiesToDF).to.be.ok;
        });
        it('should reject array having length more than 30000', (done) => {
          var arrEntity = [];
          for (let i = 0; i < 30001; i++) {
            arrEntity.push(`Entity` + i);
          }
          entities.postEntitiesToDF(`testing-collection`, arrEntity, 0)
            .catch((err) => {
              expect(err).be.an.instanceOf(Error);
              done();
            });
        });
      });
      describe('fetchEntitiesFromDF', () => {
        it('should be defined', () => {
          expect(entities.fetchEntitiesFromDF).to.be.ok;
        });
        it('should fetch information from entities', function (done) {
          this.timeout(10000);
          entities.fetchEntitiesFromDF('collection-list')
            .then(items => {
              for (let i = 0; i < items.length; i++) {
                expect(items[i]).to.be.a('string');
              }
              done();
            });
        });
      });
    });
  });
});
