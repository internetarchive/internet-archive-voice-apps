const {expect} = require('chai');
const agentUploader = require('../../../uploader/agent/agent-uploader');

describe('uploader', () => {
  describe('agent-uploader', () => {
    describe('uploadAgent', () => {
      it('should be defined', () => {
        expect(agentUploader.uploadAgent).to.be.ok;
      });
    });
  });
});
