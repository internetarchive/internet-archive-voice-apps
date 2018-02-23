const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const collection = rewire('../../search/collection')

const seventyEight = require('./fixtures/78rpm.json');

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
          expect(details).to.have.property('title', '78 RPMs and Cylinder Recordings');
        });
    });
  });
});
