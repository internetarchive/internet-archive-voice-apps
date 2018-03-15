const {expect} = require('chai');
const mustache = require('mustache');

const {playSong} = require('../../src/dialog/audio');
const strings = require('../../src/strings').dialog.playSong;

const mockApp = require('../_utils/mocking/app');

describe('dialog', () => {
  let app;
  let audio;

  beforeEach(() => {
    app = mockApp();
    audio = {
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
      playSong(app, audio);

      expect(app.ask).to.be.calledOnce;
      expect(app.buildMediaResponse).to.be.calledOnce;
      expect(app.buildMediaObject).to.be.calledOnce;
      expect(app.buildRichResponse).to.be.calledOnce;
      expect(app.addMediaObjects).to.be.calledOnce;
      expect(app.setDescription).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description, audio
        ))
      );
      expect(app.setImage).to.be.calledWith(
        audio.imageURL,
        app.Media.ImageType.LARGE
      );
      expect(app.addSimpleResponse).to.be.calledWith(
        mustache.render(mustache.render(
          strings.description,
          audio
        ))
      );
      expect(app.addSuggestionLink).to.be.calledOnce;
      expect(app.addSuggestions).to.be.calledWith(audio.suggestions);
    });

    describe('custom speech', () => {
      it('should mute songs description speech and replace it with song', () => {
        const url = 'https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg';

        playSong(app, Object.assign({}, audio, {
          speech: {
            mute: true,
            audio: {
              url,
            },
          },
        }));

        expect(app.addSimpleResponse).to.be.calledOnce;
        expect(app.addSimpleResponse.args[0][0])
          .to.include('<audio')
          .to.include(url)
          .to.include(
            mustache.render(mustache.render(
              strings.description,
              audio
            ))
          );
      });

      it('should use default speech setting when mute is true', () => {

      });
    });
  });
});
