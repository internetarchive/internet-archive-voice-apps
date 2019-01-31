const { expect } = require('chai');
const mustache = require('mustache');
const rewire = require('rewire');

const audio = rewire('../../src/dialog/audio');
const allowedStrings = require('../../src/strings').dialog.playSong;

const mockApp = require('../_utils/mocking/platforms/app');

describe('dialog', () => {
  let app;
  let options;

  beforeEach(() => {
    app = mockApp();
    options = {
      audioURL: 'http://archive.org/download/gd73-06-10d1t01.mp3',
      collections: ['etree'],
      coverage: 'Washington, DC',
      creator: 'Grateful Dead',
      imageURL: 'http://archive.org/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Covers/GD6-10-73backtyedie.jpg',
      suggestions: ['rewind', 'next'],
      title: 'Morning Dew',
      track: 1,
      year: 1973,
      url: 'http://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg',
    };

    audio.__set__('availableStrings', {
      description: '{{creator}}{{#coverage}} in {{coverage}}{{/coverage}}{{#year}}, {{year}}{{/year}}',
      speech: `
        <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
               clipBegin="4.5s"
               clipEnd="5.5s"
               soundLevel="10db">
          <desc>Playing track - Breezin&amp;#39;, Northampton, MA, 2010</desc>
        </audio>
      `,
      title: '{{title}}',
      suggestionLink: 'on Archive.org',
      suggestions: [
        'next song'
      ],
    });
  });

  describe('playSong', () => {
    it('should share audio response with user', () => {
      const strings = allowedStrings[0];
      audio.playSong(app, options);

      expect(app.response).to.be.called;

      const res = app.response.args[0][0];
      expect(res).to.have.property(
        'speech',
        mustache.render(mustache.render(
          strings.description,
          options
        ))
      );
      expect(res).to.have.property('media').to.have.lengthOf(1);
      expect(res.media[0]).to.be.deep.equal({
        description: mustache.render(mustache.render(
          strings.description, options
        )),
        contentURL: options.audioURL,
        imageURL: options.imageURL,
        offset: undefined,
        previousTrack: {
          contentURL: undefined,
        },
        name: mustache.render(strings.title, options),
      });
      expect(res).to.have.property('mediaResponseOnly');
      expect(res).to.have.property('suggestions').to.have.lengthOf(2);
      expect(res.suggestions[0]).to.equal('next song');
      expect(res.suggestions[1]).to.deep.equal({
        url: 'http://gactions-api.archive.org/proxy/details/',
        title: mustache.render(strings.suggestionLink, options),
      });
    });

    it('should mute songs description speech and replace it with template (for example sound)', () => {
      const soundURL = 'http://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg';
      const strings = allowedStrings[0];

      audio.playSong(app, Object.assign({}, options, {
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

      expect(app.response).to.be.called;
      expect(app.response.args[0][0]).to.have.property('speech')
        .to.include('<media soundLevel="-10db">')
        .to.include(soundURL)
        .to.include(description);
    });
  });
});
