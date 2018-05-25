const {expect} = require('chai');
const prepareAgent = require('../../../uploader/utils/prepare-agent');

describe('uploader', () => {
  describe('prepare-agent', () => {
    describe('prepareAgentToPostToDF', () => {
      it('should be defined', () => {
        expect(prepareAgent.prepareAgentToPostToDF).to.be.ok;
      });
    });
    describe('prepareAgentToFetchFromDF', () => {
      it('should be defined', () => {
        expect(prepareAgent.prepareAgentToFetchFromDF).to.be.ok;
      });
    });
  });
});
