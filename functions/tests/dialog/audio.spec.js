const {expect} = require('chai');
const mustache = require('mustache');

const {playSong} = require('../../src/dialog/audio');
const strings = require('../../src/strings').dialog.playSong;

const mockApp = require('../_utils/mocking/app');

describe('dialog', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('playSong', () => {
    it('should share audio response with user', () => {
      const audioURL = 'https://archive.org/download/gd73-06-10d1t01.mp3';
      const coverage = 'Washington, DC';
      const imageURL = 'https://archive.org/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Covers/GD6-10-73backtyedie.jpg';
      const suggestions = ['rewind', 'next'];
      const title = 'Morning Dew';
      const track = 1;
      const year = 1973;

      playSong(app, {
        audioURL,
        coverage,
        imageURL,
        suggestions,
        title,
        track,
        year,
      });

      expect(app.ask).to.be.calledOnce;
      expect(app.buildMediaResponse).to.be.calledOnce;
      expect(app.buildMediaObject).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addMediaObjects).to.be.calledOnce;
      expect(app.setDescription).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description,
          {audioURL, coverage, imageURL, suggestions, title, track, year}
        ))
      );
      expect(app.setImage).to.be.calledWith(
        imageURL,
        app.Media.ImageType.LARGE
      );
      expect(app.addSimpleResponse).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description,
          {audioURL, coverage, imageURL, suggestions, title, track, year}
        ))
      );
      expect(app.addSuggestionLink).to.be.calledOnce;
      expect(app.addSuggestions).to.be.calledWith(suggestions);
    });
  });
});
