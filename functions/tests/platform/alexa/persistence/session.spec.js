const { expect } = require('chai');

const mockHandlerInput = require('../../../_utils/mocking/platforms/alexa/handler-input');
const persistence = require('../../../../src/platform/alexa/persistence/session');

describe('platform', () => {
  describe('alexa', () => {
    describe('persistence', () => {
      let persistentAttributes;

      beforeEach(() => {
        persistentAttributes = {};
      });

      describe('device level', () => {
        it('should share state for one device', () => {
          const handlerInput = mockHandlerInput({ deviceId: 'device' });
          persistence(handlerInput, persistentAttributes).setData('value', 'hello world');

          expect(
            persistence(handlerInput, persistentAttributes).getData('value')
          ).to.be.equal('hello world');
        });

        it('should share state for one device', () => {
          const handlerInput1 = mockHandlerInput({ deviceId: 'device1' }, persistentAttributes);
          const handlerInput2 = mockHandlerInput({ deviceId: 'device2' }, persistentAttributes);

          persistence(handlerInput1, persistentAttributes).setData('value', '1');
          persistence(handlerInput2, persistentAttributes).setData('value', '2');

          expect(
            persistence(handlerInput1, persistentAttributes).getData('value')
          ).to.be.equal('1');
          expect(
            persistence(handlerInput2, persistentAttributes).getData('value')
          ).to.be.equal('2');
        });
      });

      describe('drop all', () => {
        it('should remove all session level attributes', () => {
          const handlerInput = mockHandlerInput({ deviceId: 'device' });
          persistence(handlerInput, persistentAttributes).setData('artist', 'Grateful Dead');
          persistence(handlerInput, persistentAttributes).setData('year', '1979');
          persistence(handlerInput, persistentAttributes).setData('genre', 'rock');

          persistence(handlerInput, persistentAttributes).dropAll();

          expect(persistence(handlerInput, persistentAttributes).getData('artist')).to.be.undefined;
          expect(persistence(handlerInput, persistentAttributes).getData('year')).to.be.undefined;
          expect(persistence(handlerInput, persistentAttributes).getData('genre')).to.be.undefined;
        });
      });

      describe('#isEmpty', () => {
        it('should return true if session data is empty', () => {
          const handlerInput1 = mockHandlerInput({ deviceId: 'device1' }, persistentAttributes);
          const handlerInput2 = mockHandlerInput({ deviceId: 'device2' }, persistentAttributes);
          persistence(handlerInput1, persistentAttributes).setData('value', '1');

          expect(persistence(handlerInput2, persistentAttributes).isEmpty()).to.be.true;
        });

        it('should return false if session data is not empty', () => {
          mockHandlerInput({ deviceId: 'device1' }, persistentAttributes);
          const handlerInput2 = mockHandlerInput({ deviceId: 'device2' }, persistentAttributes);
          persistence(handlerInput2, persistentAttributes).setData('value', '1');

          expect(persistence(handlerInput2, persistentAttributes).isEmpty()).to.be.false;
        });
      });
    });
  });
});
