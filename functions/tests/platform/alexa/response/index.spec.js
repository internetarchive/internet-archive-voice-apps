const {expect} = require('chai');

const alexaMock = require('../../../_utils/mocking/platforms/alexa');
const ask = require('../../../../src/platform/alexa/response/ask');

describe('platform', () => {
  describe('assistant', () => {
    describe('response', () => {
      let alexa;

      beforeEach(() => {
        alexa = alexaMock();
      });

      it('should speak speech argument', () => {
        ask(alexa)({speech: 'hello world!'});
        expect(alexa.response.speak).to.have.been
          .calledWith('hello world!');
      });

      it('should hint suggestions', () => {
        ask(alexa)({
          speech: 'hello world!',
          suggestions: ['world one', 'world two'],
        });

        expect(alexa.response.hint).to.have.been.calledTwice;
        expect(alexa.response.hint.args[0][0]).to.be.equal('world one');
        expect(alexa.response.hint.args[1][0]).to.be.equal('world two');
      });

      it('should unpack array of speeaches', () => {
        ask(alexa)({
          speech: [
            `Well, there ain't nobody safer than someone who doesn't care.`,
            `And it isn't even lonely when no one's ever there.`,
          ],
        });

        expect(alexa.response.speak).to.have.been
          .calledWith(
            `Well, there ain't nobody safer than someone who doesn't care.\n` +
            `And it isn't even lonely when no one's ever there.`
          );
      });

      it.skip('should start playing audio file from passed url', () => {
        ask(alexa)({
          speech: [
            'Great choice!',
            `Let's play song Title`,
          ],
          media: [{
            name: 'song title',
            description: 'some description',
            contentURL: 'https://archive.org/download/song.mp3',
            imageURL: 'https://archive.org/download/image.jpg',
          }],
          suggestions: [
            'next song',
            {
              url: 'https://archive.org/details/etree',
              title: 'on Archive.org'
            },
          ],
        });

        expect(alexa.response.speak).to.have.been
          .calledWith(
            'Great choice!\n' +
            `Let's play song Title`
          );

        expect(alexa.response.audioPlayerPlay).to.have.been
          .calledWith(
            'REPLACE_ALL',
            'https://archive.org/download/song.mp3',
            'https://archive.org/download/song.mp3',
            null,
            0
          );

        // expect(assistant.buildRichResponse).to.have.been.called;
        // expect(assistant.addSimpleResponse).to.have.been.calledTwice;
        // expect(assistant.addSimpleResponse.args[0][0]).to.be.equal('<speak>Great choice!</speak>');
        // expect(assistant.addSimpleResponse.args[1][0]).to.be.equal(`<speak>Let's play song Title</speak>`);
        // expect(assistant.addMediaResponse).to.have.been.called;
        // expect(assistant.buildMediaResponse).to.have.been.called;
        // expect(assistant.addMediaObjects).to.have.been.called;
        // expect(assistant.buildMediaObject).to.have.been.calledWith('song title', 'https://archive.org/download/song.mp3');
        // expect(assistant.setDescription).to.have.been.calledWith('some description');
        // expect(assistant.setImage).to.have.been.calledWith('https://archive.org/download/image.jpg');
        // expect(assistant.addSuggestions).to.have.been.calledWith(['next song']);
        // expect(assistant.addSuggestionLink).to.have.been.calledWith(
        //   'on Archive.org',
        //   'https://archive.org/details/etree'
        // );
      });
    });
  });
});
