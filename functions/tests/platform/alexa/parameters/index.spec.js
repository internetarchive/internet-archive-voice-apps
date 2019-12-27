const { expect } = require('chai');

const mockHandlerInput = require('../../../_utils/mocking/platforms/alexa/handler-input');

const paramsBuilder = require('../../../../src/platform/alexa/parameters');

describe('platform', () => {
  describe('alexa', () => {
    let handlerInput;

    beforeEach(() => {
      handlerInput = mockHandlerInput({
        error: {
          message: 'An exception occurred while dispatching the request to the skill.',
        },

        slots: {
          CITY: { value: 'NY' },
          COLLECTION_ID: { value: 'etree' },
          BAND: { value: 'Grateful Dead' },
          'SUBJECT.IA': { value: 'rock' },
          SWITCH: {
            name: 'VALUE',
            value: 'on',
            resolutions: {
              resolutionsPerAuthority: [{
                authority: 'amzn1.er-qwerty.BOOLEAN',
                status: { code: 'ER_SUCCESS_MATCH' },
                values: [{
                  value: {
                    name: 'true',
                    id: '5e01b4d8903c7b71831c5fc9be3b1f69',
                  },
                }],
              }],
            },
            confirmationStatus: 'NONE',
          },
        },

        reason: 'ERROR',
      });
    });

    describe('parameters', () => {
      it('should be caps agnostic', () => {
        const params = paramsBuilder(handlerInput);
        expect(params.getByName('city')).to.be.equal('NY');
        expect(params.getByName('collectionId')).to.be.equal('etree');
        expect(params.getByName('year')).to.be.undefined;
      });

      it('should fetch id defined', () => {
        const params = paramsBuilder(handlerInput);
        expect(params.getByName('switch')).to.be.equal('true');
      });

      it('should get reason of intent', () => {
        const params = paramsBuilder(handlerInput);
        expect(params.getByName('reason')).to.be.equal('ERROR');
      });

      it('should get error of intent', () => {
        const params = paramsBuilder(handlerInput);
        expect(params.getByName('error'))
          .to.have.property('message', 'An exception occurred while dispatching the request to the skill.');
      });

      it('should return undefined if we don\'t have slots', () => {
        const params = paramsBuilder(mockHandlerInput({ slots: null }));
        expect(params.getByName('id')).to.be.undefined;
      });

      it('should get synonym slot', () => {
        const params = paramsBuilder(handlerInput);
        expect(params.getByName('subject')).to.be.equal('rock');
      });
    });
  });
});
