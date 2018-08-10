// const {expect} = require('chai');
const rewire = require('rewire');

const util = require('util');

const logRequest = rewire('../../../../src/platform/assistant/middlewares/log-request.js');

describe('platform', () => {
  describe('assistant', () => {
    describe('middlewares', () => {
      describe('log-request.js', () => {
        const mockConv =
        {
          'available':
          'Available { surfaces: AvailableSurfaces { list: [Array], capabilities: [AvailableSurfacesCapabilities] } }',
          'user': {'raw':
            {
              'userStorage': '',
              'lastSeen': '2018-08-06T01:28:00Z',
              'locale': 'en-US',
              'userId': 'ABwppHHNHk4Zbo-dfLsVx1UB3nqSPQb6GmWWS4P3WMAQRhqty4U69TWWh9EiMxjws_qrHvNcwA8K7nb4Hc4'
            }
          },

          'storage':
          {
            'userId': 'ed670f41-ee7a-48a0-8f3d-84976a327017'
          },
          '_id': 'ABwppHHNHk4Zbo-dfLsVx1UB3nqSPQb6GmWWS4P3WMAQRhqty4U69TWWh9EiMxjws_qrHvNcwA8K7nb4Hc4',
          'locale': 'en-US',
          'permissions': [],
        };

        beforeEach(() => {
          logRequest(mockConv);
        });

        it(`should store userId when it is present in the conv data`, () => {
          console.log('Inside first test: ' + util.inspect(mockConv, false, null));
          // expect(mockConv).to.have.property('userID', 'ed670f41-ee7a-48a0-8f3d-84976a327017');
        });

        it(`should create userId when it's not in conv data`, () => {
          delete mockConv.storage.userId;
          logRequest(mockConv);
          console.log('Inside second test: ' + util.inspect(mockConv, false, null));
          // expect(mockConv).to.have.property('userID').and.to.have.lengthOf(36);
        });
      }); // end of log-request
    });
  });
});
