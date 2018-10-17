const { expect } = require('chai');

const mockApp = require('../_utils/mocking/platforms/app');
const playbackStopped = require('../../src/actions/playback-stopped');

describe('actions', () => {
  describe('playback stopped', () => {
    let app;

    beforeEach(() => {
      app = mockApp({
        offset: 12345,
      });
    });

    it('should store offset', () => {
      playbackStopped.handler(app);
      expect(app.persist.setData).to.have.been.called;
      expect(app.persist.setData.args[0][1]).to.have.property('offset', 12345);
    });
  });
});
