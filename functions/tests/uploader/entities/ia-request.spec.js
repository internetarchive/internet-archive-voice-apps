const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const iaRequest = rewire('../../../uploader/entities/ia-request');

const getCollectionFromIA = require('./fixtures/get-collection-from-ia.json');
const getGenresFromIA = require('./fixtures/get-genres-from-ia.json');

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
          expect(iaRequest.getUniqueCreatorsFromIA(original)).to.be.eql(expected);
        });

        it('should return unique array for genres', () => {
          var original = [{'creator': ['Jackson', 'Bauer']}, {'creator': ['Connie\'s Inn Orchestra', 'Jackson']}, {'creator': ['Paul Ric...sticker', 'Rice Brothers\' Gang']}];
          var expected = [`Jackson`, `Bauer`, `Connie's Inn Orchestra`, `Paul Ric...sticker`, `Rice Brothers' Gang`];
          expect(iaRequest.getUniqueCreatorsFromIA(original)).to.be.eql(expected);
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
                .get('begin:https://web.archive.org/advancedsearch.php?q=collection:(etree)', getCollectionFromIA)
            );
          });

          it('should fetch collection from IA', () => {
            iaRequest.fetchEntitiesFromIA(`etree`, `10`)
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
                .get('begin:https://web.archive.org/advancedsearch.php?q=collection:(georgeblood)', getGenresFromIA)
            );
          });

          it('should fetch genres from IA', () => {
            iaRequest.fetchEntitiesFromIA(`georgeblood`, `10`)
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
    });
  });
});
