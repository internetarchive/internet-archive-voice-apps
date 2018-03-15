const {expect} = require('chai');
const mustache = require('mustache');

const {playSong} = require('../../src/dialog/audio');
const strings = require('../../src/strings').dialog.playSong;

const mockApp = require('../_utils/mocking/app');

describe('dialog', () => {
  let app;
  let options;

  beforeEach(() => {
    app = mockApp();
    options = {
      audioURL: 'https://archive.org/download/gd73-06-10d1t01.mp3',
      coverage: 'Washington, DC',
      imageURL: 'https://archive.org/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Covers/GD6-10-73backtyedie.jpg',
      suggestions: ['rewind', 'next'],
      title: 'Morning Dew',
      track: 1,
      year: 1973,
      url: 'https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg',
    };
  });

  describe('playSong', () => {
    it('should share audio response with user', () => {
      playSong(app, options);

      expect(app.ask).to.be.calledOnce;
      expect(app.buildMediaResponse).to.be.calledOnce;
      expect(app.buildMediaObject).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addMediaObjects).to.be.calledOnce;
      expect(app.setDescription).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description, options
        ))
      );
      expect(app.setImage).to.be.calledWith(
        options.imageURL,
        app.Media.ImageType.LARGE
      );
      expect(app.addSimpleResponse).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description,
          options
        ))
      );
      expect(app.addSuggestionLink).to.be.calledOnce;
      expect(app.addSuggestions).to.be.calledWith(options.suggestions);
    });

    it('should mute songs description speech and replace it with template (for example sound)', () => {
      const soundURL = 'https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg';

      playSong(app, Object.assign({}, options, {
        speech: `
          <media soundLevel="-10db">
            <audio src="${soundURL}">
              <desc>{{description}}</desc>
            </audio>
          </media>
        `,
      }));

      const description = mustache.render(mustache.render(
        strings.description,
        options
      ));

      expect(app.addSimpleResponse).to.be.calledOnce;
      expect(app.addSimpleResponse.args[0][0])
        .to.include('<media soundLevel="-10db">')
        .to.include(soundURL)
        .to.include(description);
    });
  });
});
