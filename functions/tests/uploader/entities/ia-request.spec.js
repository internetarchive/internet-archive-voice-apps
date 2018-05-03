const {expect} = require('chai');
const fetchMock = require('fetch-mock');

fetchMock.config.overwriteRoutes = true;
fetchMock.config.repeat = true;
const rewire = require('rewire');
const sinon = require('sinon');

const iaRequest = rewire('../../../uploader/entities/ia-request');

var entities = require('../../../uploader/entities/entities');
const getCollectionFromIA = require('./fixtures/get-collection-from-ia.json');
const getGenresFromIA = require('./fixtures/get-genres-from-ia.json');
const successFromDF = require('./fixtures/success-from-df.json');

let postEntitiesToDF;

describe('uploader', () => {
  describe('entities', () => {
    describe('ia-request', () => {
      describe('getUniqueCreatorsFromIA', () => {
        it('should be defined', () => {
          expect(iaRequest.getUniqueCreatorsFromIA).to.be.ok;
        });

        it('should return unique array for collection', () => {
          var original = [{'creator': 'Grateful Dead'}, {'creator': 'Grateful Dead'}, {'creator': 'Disco Biscuits'}, {'creator': 'Phil Lesh (and Friends)'}];
          var expected = [`Grateful Dead`, `Disco Biscuits`, `Phil Lesh and Friends`];
          expect(iaRequest.getUniqueCreatorsFromIA(original, `creator`)).to.be.eql(expected);
        });

        it('should return unique array for genres', () => {
          var original = [{'creator': ['Jackson', 'Bauer']}, {'creator': ['Connie\'s Inn Orchestra', 'Jackson']}, {'creator': ['Paul Ric...sticker', 'Rice Brothers\' Gang']}];
          var expected = [`Jackson`, `Bauer`, `Connie's Inn Orchestra`, `Paul Ric...sticker`, `Rice Brothers' Gang`];
          expect(iaRequest.getUniqueCreatorsFromIA(original, `creator`)).to.be.eql(expected);
        });
      });

      describe('fetchEntitiesFromIA', () => {
        it('should be defined', () => {
          expect(iaRequest.fetchEntitiesFromIA).to.be.ok;
        });

        describe('forCollection', () => {
          beforeEach(() => {
            iaRequest.__set__(
              'fetch',
              fetchMock
                .sandbox()
                .get('begin:https://gactions-api.archive.org/advancedsearch.php?q=collection:', getCollectionFromIA)
            );
          });
          it('should fetch collection from IA', () => {
            iaRequest.fetchEntitiesFromIA(`etree`, `creator`, `10`)
              .then(items => {
                for (let i = 0; i < items.length; i++) {
                  expect(items[i]).to.be.a('string');
                }
              });
          });
        });

        describe('forGenres', () => {
          beforeEach(() => {
            iaRequest.__set__(
              'fetch',
              fetchMock
                .sandbox()
                .get('begin:https://gactions-api.archive.org/advancedsearch.php?q=collection:', getGenresFromIA)
            );
          });

          it('should fetch genres from IA', () => {
            iaRequest.fetchEntitiesFromIA(`georgeblood`, `subject`, `10`)
              .then(items => {
                for (let i = 0; i < items.length; i++) {
                  expect(items[i]).to.be.a('string');
                }
              });
          });
        });
      });
    });

    describe('fetchNewEntitiesFromIAAndPostToDF', () => {
      it('should be defined', () => {
        expect(iaRequest.fetchNewEntitiesFromIAAndPostToDF).to.be.ok;
      });

      describe('forCollection', () => {
        beforeEach(() => {
          postEntitiesToDF = sinon.stub(entities, 'postEntitiesToDF').returns(successFromDF);
          iaRequest.__set__(
            'fetch',
            fetchMock
              .sandbox()
              .get('begin:https://gactions-api.archive.org/advancedsearch.php?q=collection:', getCollectionFromIA)
          );
        });
        afterEach(() => {
          fetchMock.restore();
          postEntitiesToDF.restore();
        });
        it('should fetch collection from IA and post to DF', () => {
          iaRequest.fetchNewEntitiesFromIAAndPostToDF(`testing-collection`, `etree`, `creator`, `10`)
            .then(data => {
              expect(data).to.be.eql(successFromDF);
            });
        });
      });
    });
  });
});
