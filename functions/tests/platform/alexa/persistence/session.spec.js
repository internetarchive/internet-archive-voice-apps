const {expect} = require('chai');

const mockHandlerInput = require('../../../_utils/mocking/platforms/alexa/handler-input');
const persistance = require('../../../../src/platform/alexa/persistence/session');

describe('platform', () => {
  describe('alexa', () => {
    describe('persistance', () => {
      describe('device level', () => {
        it('should share state for one device', () => {
          const handlerInput = mockHandlerInput({deviceId: 'device'});
          persistance(handlerInput).setData('value', 'hello world');
          expect(handlerInput.attributesManager.setSessionAttributes).to.be.called;
          expect(handlerInput.attributesManager.setSessionAttributes.args[0][0]).to.be.deep.equal({
            value: 'hello world',
          });
        });

        it('should share state for one device', () => {
          const handlerInput1 = mockHandlerInput({deviceId: 'device1'});
          const handlerInput2 = mockHandlerInput({deviceId: 'device2'});

          persistance(handlerInput1).setData('value', '1');
          persistance(handlerInput2).setData('value', '2');

          expect(handlerInput1.attributesManager.setSessionAttributes.args[0][0]).to.be.deep.equal({
            value: '1',
          });
          expect(handlerInput2.attributesManager.setSessionAttributes.args[0][0]).to.be.deep.equal({
            value: '2',
          });
        });
      });
    });
  });
});
