const {expect} = require('chai');
const entities = require('../../../uploader/entities/entities');

describe('uploader', () => {
  describe('entities', () => {
    describe('entities', () => {
      describe('postEntitiesToDF', () => {
        it('should be defined', () => {
          expect(entities.postEntitiesToDF).to.be.ok;
        });
        it('should reject array having length more than 30000', () => {
          var arrEntity = [];
          for (let i = 0; i < 30001; i++) {
            arrEntity.push(`Entity` + i);
          }
          const condition = entities.postEntitiesToDF(`testing-collection`, arrEntity, 0);
          //  postEntitiesToDF(entityname, dif, 0);
          expect(condition).to.have.string(`Can't upload`);
        });
      });
      describe('fetchEntitiesFromDF', () => {
        it('should be defined', () => {
          expect(entities.fetchEntitiesFromDF).to.be.ok;
        });
      });
    });
  });
});
