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
          SWITCH: {
            name: 'VALUE',
            value: 'on',
            resolutions: {
              resolutionsPerAuthority: [{
                authority: 'amzn1.er-qwerty.BOOLEAN',
                status: {code: 'ER_SUCCESS_MATCH'},
                values: [{value: {name: 'true', id: 'true'}}]
              }]
            },
            confirmationStatus: 'NONE'
          }
        }
      });
    });

    describe('parameters', () => {
      it('should be caps agnostic', () => {
        const params = paramsBuilder(platform);
        expect(params.getByName('city')).to.be.equal('NY');
        expect(params.getByName('collectionId')).to.be.equal('etree');
        expect(params.getByName('year')).to.be.undefined;
      });

      it('should fetch id defined', () => {
        const params = paramsBuilder(platform);
        expect(params.getByName('switch')).to.be.equal('true');
      });
    });
  });
});
