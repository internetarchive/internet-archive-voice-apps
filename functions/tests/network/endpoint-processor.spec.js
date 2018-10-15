const {expect} = require('chai');
const rewire = require('rewire');

const endpointProcessor = rewire('../../src/network/endpoint-processor');

describe('provider', () => {
  describe('endpoint processor', () => {
    let app;
    let config;

    beforeEach(() => {
      app = {
        platform: 'onePlatform',
      };

      config = {
        platforms: {
          onePlatform: {
            endpoint: {
              platformSubDomain: 'one-platform',
            },
          },
        },
      };
      endpointProcessor.__set__('config', config);
    });

    it('should substitute platform specific parts', () => {
      const url = endpointProcessor.preprocess(
        'http://{{platformSubDomain}}.archive.org/metadata/{{id}}',
        app,
        {id: '12345'}
      );

      expect(url).to.be.equal(
        'http://one-platform.archive.org/metadata/12345'
      );
    });
  });
});
