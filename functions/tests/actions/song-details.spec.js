const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const action = rewire('../../src/actions/playback/song-details');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  describe('song details', () => {
    let app;
    let dialog;
    let playbackHelpers;

    beforeEach(() => {
      app = mockApp({
        getData: {
          playlist: {
            current: 1,
            items: [
              { track: 1, title: 'song 1', creator: 'grateful dead' },
              { track: 2, title: 'song 2', creator: 'grateful dead' },
              { track: 3, title: 'song 3', creator: 'grateful dead' },
            ],
          },
        },
      });
      dialog = mockDialog();
      action.__set__('dialog', dialog);

      playbackHelpers = {
        resume: sinon.spy(),
      };
      action.__set__('helpers', playbackHelpers);
    });

    it('should tell record title and artist name', () => {
      action.handler(app);
      expect(dialog.ask).to.have.been.called;
      expect(dialog.ask.args[0][1]).to.have.property('speech')
        .and.include('song 2').include('grateful dead');
      expect(playbackHelpers.resume).to.have.been.called;
    });
  });
});
