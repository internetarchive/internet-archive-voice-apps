const { expect } = require('chai');

const mockAssistant = require('../../../_utils/mocking/platforms/assistant');

const persistence = require('../../../../src/platform/assistant/persistence/session');

describe('platform', () => {
  describe('assistant', () => {
    describe('persistence', () => {
      describe('device level', () => {
        it('should share state for one device', () => {
          const device = mockAssistant({ deviceId: 'device' });
          persistence(device).setData('value', 'hello world');
          expect(persistence(device).getData('value')).to.be.equal('hello world');
        });

        it(`shouldn't share state for different devices`, () => {
          const device1 = mockAssistant({ deviceId: 'device1' });
          const device2 = mockAssistant({ deviceId: 'device2' });
          persistence(device1).setData('value', '1');
          persistence(device2).setData('value', '2');
          expect(persistence(device1).getData('value'))
            .to.not.be.equal(persistence(device2).getData('value'));
        });

        it('should return true when data was stored', () => {
          const p = persistence(mockAssistant());
          const res = p.setData('value', 'hello world');
          expect(res).to.be.true;
        });

        // it works for user's persistent layer
        it.skip('should revert changes when we exceed the limit of session data', () => {
          const p = persistence(mockAssistant());
          p.setData('value', 'hello world');
          const res = p.setData('value', 'x'.repeat(10000));
          expect(res).to.be.false;
          expect(p.getData('value')).to.be.equal('hello world');
        });
      });

      describe('drop all', () => {
        it('should remove all session level attributes', () => {
          const conv = mockAssistant();
          persistence(conv).setData('artist', 'Grateful Dead');
          persistence(conv).setData('year', '1979');
          persistence(conv).setData('genre', 'rock');

          persistence(conv).dropAll();

          expect(persistence(conv).getData('artist')).to.be.undefined;
          expect(persistence(conv).getData('year')).to.be.undefined;
          expect(persistence(conv).getData('genre')).to.be.undefined;
        });
      });

      describe('#isEmpty', () => {
        it('should return true if session data is empty', () => {
          const conv = mockAssistant();
          expect(persistence(conv).isEmpty()).to.be.true;
        });

        it('should return false if session data is not empty', () => {
          const conv = mockAssistant();
          persistence(conv).setData('genre', 'rock');
          expect(persistence(conv).isEmpty()).to.be.false;
        });
      });
    });
  });
});
