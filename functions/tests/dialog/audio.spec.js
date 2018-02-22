const {expect} = require('chai');
const {audio} = require('../../dialog/audio');
const mockApp = require('../_utils/mocking/app');

describe('dialog', () => {
  describe('audio', () => {
    let app;

    beforeEach(() => {
      app = mockApp();
    });

    it('should share audio response with user', () => {
      const audioURL = 'https://archive.org/download/gd73-06-10d1t01.mp3';
      const coverage = 'https://archive.org/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Covers/GD6-10-73backtyedie.jpg';
      const suggestions = ['rewind', 'next'];
      const title = 'Morning Dew';
      const track = 1;
      const year = 1973;

      audio(app, {audioURL, coverage, suggestions, title, track, year});

      expect(app.ask).to.be.calledOnce;
      expect(app.buildMediaResponse).to.be.calledOnce;
      expect(app.buildMediaObject).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addMediaObjects).to.be.calledOnce;
      expect(app.setDescription).to.be.calledOnce;
      expect(app.setImage).to.be.calledOnce;
      expect(app.addSuggestionLink).to.be.calledOnce;
      expect(app.addSuggestions).to.be.calledWith(suggestions);
    });
  });
});
