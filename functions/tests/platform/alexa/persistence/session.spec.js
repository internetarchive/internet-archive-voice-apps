const {expect} = require('chai');

const mockAlexa = require('../../../_utils/mocking/platforms/alexa');
const persistance = require('../../../../src/platform/alexa/persistence/session');

describe('platform', () => {
  describe('alexa', () => {
    describe('persistance', () => {
      describe('device level', () => {
        it('should share state for one device', () => {
          const device = mockAlexa({deviceId: 'device'});
          persistance(device).setData('value', 'hello world');
          expect(persistance(device).getData('value')).to.be.equal('hello world');
        });

        it('should share state for one device', () => {
          const device1 = mockAlexa({deviceId: 'device1'});
          const device2 = mockAlexa({deviceId: 'device2'});
          persistance(device1).setData('value', '1');
          persistance(device2).setData('value', '2');
          expect(persistance(device1).getData('value'))
            .to.not.be.equal(persistance(device2).getData('value'));
        });
      });
    });
  });
});
