const {expect} = require('chai');
const fetchMock = require('fetch-mock');
const rewire = require('rewire');

const entities = rewire('../../../uploader/entities/entities');

const getEntitiesFromDF = require('./fixtures/get-entities-from-df.json');
const successFromDF = require('./fixtures/success-from-df.json');

describe('uploader', () => {
  describe('entities', () => {
    describe('entities', () => {
      describe('postEntitiesToDF', () => {
        beforeEach(() => {
          entities.__set__(
            'fetch',
            fetchMock
              .sandbox()
              .post('begin:https://api.dialogflow.com/v1/entities/testing-collection/entries?v=20150910', {'body': successFromDF})
          );
        });

        it('should be defined', () => {
          expect(entities.postEntitiesToDF).to.be.ok;
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

      describe('fetchEntitiesFromDF', () => {
        beforeEach(() => {
          entities.__set__(
            'fetch',
            fetchMock
              .sandbox()
              .get('begin:https://api.dialogflow.com/v1/entities/testing-collection?v=20150910', getEntitiesFromDF)
          );
        });
        it('should be defined', () => {
          expect(entities.fetchEntitiesFromDF).to.be.ok;
        });

        it('should fetch entity information from DF', () => {
          return entities.fetchEntitiesFromDF('testing-collection')
            .then(items => {
              for (let i = 0; i < items.length; i++) {
                expect(items[i]).to.be.a('string');
              }
            });
        });
      });
    });
  });
});
