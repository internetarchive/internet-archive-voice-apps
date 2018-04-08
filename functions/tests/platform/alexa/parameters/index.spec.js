const {expect} = require('chai');

const mockPlatform = require('../../../_utils/mocking/platforms/alexa');

const paramsBuilder = require('../../../../src/platform/alexa/parameters');

describe('platform', () => {
  describe('alexa', () => {
    let platform;

    beforeEach(() => {
      platform = mockPlatform({
        slots: {
          CITY: {value: 'NY'},
          COLLECTION_ID: {value: 'etree'},
          BAND: {value: 'Grateful Dead'},
        }
      });
    });

    describe('parameters', () => {
      it('should return parameter by name', () => {
        const params = paramsBuilder(platform);
        expect(params.getParam('CITY')).to.be.equal('NY');
        expect(params.getParam('YEAR')).to.be.undefined;
      });

      it.skip('should be caps agnostic', () => {
        const params = paramsBuilder(platform);
        expect(params.getParam('city')).to.be.equal('NY');
        expect(params.getParam('collectionId')).to.be.equal('etree');
        expect(params.getParam('year')).to.be.undefined;
      });
    });
  });
});
