const {expect} = require('chai');
const fetchMock = require('fetch-mock');
const rewire = require('rewire');

var entities = rewire('../../../uploader/entities/entities');
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
            entities.__set__(
              'fetch',
              fetchMock
                .sandbox()
                .post('begin:https://dialogflow.googleapis.com/v2/projects/internet-archive/agent/entityTypes', {'body': successFromDF})
            );
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
            entities.__set__(
              'fetch',
              fetchMock
                .sandbox()
                .post('begin:https://dialogflow.googleapis.com/v2/projects/internet-archive/agent/entityTypes', {'body': failFromDF})
            );
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
