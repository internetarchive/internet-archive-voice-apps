const { expect } = require('chai');

const mockAssistant = require('../../../_utils/mocking/platforms/assistant');

const persistance = require('../../../../src/platform/assistant/persistence/session');

describe('platform', () => {
  describe('assistant', () => {
    describe('persistance', () => {
      describe('device level', () => {
        it('should share state for one device', () => {
          const device = mockAssistant({ deviceId: 'device' });
          persistance(device).setData('value', 'hello world');
          expect(persistance(device).getData('value')).to.be.equal('hello world');
        });

        it(`shouldn't share state for different devices`, () => {
          const device1 = mockAssistant({ deviceId: 'device1' });
          const device2 = mockAssistant({ deviceId: 'device2' });
          persistance(device1).setData('value', '1');
          persistance(device2).setData('value', '2');
          expect(persistance(device1).getData('value'))
            .to.not.be.equal(persistance(device2).getData('value'));
        });

        it('should return true when data was stored', () => {
          const p = persistance(mockAssistant());
          const res = p.setData('value', 'hello world');
          expect(res).to.be.true;
        });

        // it works for user's persistant layer
        it.skip('should revert changes when we exceed the limit of session data', () => {
          const p = persistance(mockAssistant());
          p.setData('value', 'hello world');
          const res = p.setData('value', 'x'.repeat(10000));
          expect(res).to.be.false;
          expect(p.getData('value')).to.be.equal('hello world');
        });
      });

      describe('drop all', () => {
        it('should remove all session level attributes', () => {
          const conv = mockAssistant();
          persistance(conv).setData('artist', 'Grateful Dead');
          persistance(conv).setData('year', '1979');
          persistance(conv).setData('genre', 'rock');

          persistance(conv).dropAll();

          expect(persistance(conv).getData('artist')).to.be.undefined;
          expect(persistance(conv).getData('year')).to.be.undefined;
          expect(persistance(conv).getData('genre')).to.be.undefined;
        });
      });
    });
  });
});
