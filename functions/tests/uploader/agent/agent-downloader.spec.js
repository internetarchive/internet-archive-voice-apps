const {expect} = require('chai');
const agentDownloader = require('../../../uploader/agent/agent-downloader');

describe('uploader', () => {
  describe('agent-downloader', () => {
    describe('downloadAgent', () => {
      it('should be defined', () => {
        expect(agentDownloader.downloadAgent).to.be.ok;
      });
    });
  });
});
