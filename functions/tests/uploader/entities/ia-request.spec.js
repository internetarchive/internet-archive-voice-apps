const {expect} = require('chai');

const iaRequest = require('../../../uploader/entities/ia-request');

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
        it('should fetch information from IA', function (done) {
          this.timeout(3000);
          iaRequest.fetchEntitiesFromIA(`etree`, `10`)
            .then(items => {
              for (let i = 0; i < items.length; i++) {
                expect(items[i]).to.be.a('string');
              }
              done();
            })
            .catch((err) => {
              expect(err).be.an.instanceOf(Error);
              done();
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
});
