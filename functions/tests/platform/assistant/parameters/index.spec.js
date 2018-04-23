const {expect} = require('chai');

const mockAssistant = require('../../../_utils/mocking/platforms/assistant');

const paramsBuilder = require('../../../../src/platform/assistant/parameters');

describe('platform', () => {
  describe('assistant', () => {
    let assistant;

    beforeEach(() => {
      assistant = mockAssistant({
        argument: {
          city: 'NY',
          band: 'Grateful Dead',
        }
      });
    });

    describe('parameters', () => {
      it('should return parameter by name', () => {
        const params = paramsBuilder(assistant);
        expect(params.getByName('city')).to.be.equal('NY');
        expect(params.getByName('year')).to.be.undefined;
      });
    });
  });
});
