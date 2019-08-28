const { expect } = require('chai');
const MockAdapter = require('axios-mock-adapter');
const rewire = require('rewire');

const entities = rewire('../../../uploader/entities/entities');
const failFromDF = require('./fixtures/fail-from-df.json');
const successFromDF = require('./fixtures/success-from-df.json');

describe('uploader', () => {
  beforeEach(() => {
    entities.__set__('getAccessToken', function () {
      return Promise.resolve('Something Else');
    });
  });

  describe('entities', () => {
    describe('entities', () => {
      describe('postEntitiesToDF', () => {
        it('should be defined', () => {
          expect(entities.postEntitiesToDF).to.be.ok;
        });

        describe('For Success', () => {
          beforeEach(() => {
            const mock = new MockAdapter(entities.__get__('axios'));
            mock.onPost().reply(200, { 'body': successFromDF });
          });

          it('should reject array having length more than 30000', () => {
            var arrEntity = [];
            for (let i = 0; i < 30001; i++) {
              arrEntity.push(`Entity` + i);
            }
            return entities.postEntitiesToDF(`testing-collection`, arrEntity, 0)
              .catch((err) => {
                expect(err).be.an.instanceOf(Error);
              });
          });

          it('should post entity information to DF', () => {
            return entities.postEntitiesToDF(`testing-collection`, ['bimmy', 'jack'], 0)
              .then(items => {
                expect(items).to.have.property('status').to.have.property('code');
              });
          });
        });

        describe('For Failed', () => {
          beforeEach(() => {
            const mock = new MockAdapter(entities.__get__('axios'));
            mock.onPost().reply(200, { 'body': failFromDF });
          });

          it('should return error information from DF', () => {
            return entities.postEntitiesToDF(`testing-collection`, ['bimmy', 'jack'], 0)
              .catch((err) => {
                expect(err).be.an.instanceOf(Error);
              });
          });
        });
      });
    });
  });
});
