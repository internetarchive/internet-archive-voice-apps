const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const collection = rewire('../../provider/collection')

const seventyEight = require('./fixtures/georgeblood.json');

describe('collection', () => {
  describe('fetchCollection', () => {
    beforeEach(() => {
      collection.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/metadata/78rpm', seventyEight)
      );
    });

    it('should fetch information about collection', () => {
      return collection.fetchDetails('78rpm')
        .then(details => {
          expect(details).to.have.property(
            'title',
            '78rpm Records Digitized by George Blood, L.P.'
          );
        });
    });
  });
});
