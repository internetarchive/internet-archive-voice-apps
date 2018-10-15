const {expect} = require('chai');

const mockHandlerInput = require('../../../_utils/mocking/platforms/alexa/handler-input');
const persistance = require('../../../../src/platform/alexa/persistence/session');

describe('platform', () => {
  describe('alexa', () => {
    describe('persistance', () => {
      let persistentAttributes;

      beforeEach(() => {
        persistentAttributes = {};
      });

      describe('device level', () => {
        it('should share state for one device', () => {
          const handlerInput = mockHandlerInput({deviceId: 'device'});
          persistance(handlerInput, persistentAttributes).setData('value', 'hello world');

          expect(
            persistance(handlerInput, persistentAttributes).getData('value')
          ).to.be.equal('hello world');
        });

        it('should share state for one device', () => {
          const handlerInput1 = mockHandlerInput({deviceId: 'device1'}, persistentAttributes);
          const handlerInput2 = mockHandlerInput({deviceId: 'device2'}, persistentAttributes);

          persistance(handlerInput1, persistentAttributes).setData('value', '1');
          persistance(handlerInput2, persistentAttributes).setData('value', '2');

          expect(
            persistance(handlerInput1, persistentAttributes).getData('value')
          ).to.be.equal('1');
          expect(
            persistance(handlerInput2, persistentAttributes).getData('value')
          ).to.be.equal('2');
        });
      });

      describe('drop all', () => {
        it('should remove all session level attributes', () => {
          const handlerInput = mockHandlerInput({deviceId: 'device'});
          persistance(handlerInput, persistentAttributes).setData('artist', 'Grateful Dead');
          persistance(handlerInput, persistentAttributes).setData('year', '1979');
          persistance(handlerInput, persistentAttributes).setData('genre', 'rock');

          persistance(handlerInput, persistentAttributes).dropAll();

          expect(persistance(handlerInput, persistentAttributes).getData('artist')).to.be.undefined;
          expect(persistance(handlerInput, persistentAttributes).getData('year')).to.be.undefined;
          expect(persistance(handlerInput, persistentAttributes).getData('genre')).to.be.undefined;
        });
      });
    });
  });
});
