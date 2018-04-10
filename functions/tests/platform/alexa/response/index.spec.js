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

      // I received error, when tried to send more then one hint:
      // The skill's response must not contain more than 1 Hint directive(s) for this request type.
      it('should hint suggestions. And only one because of Alexa limitation', () => {
        ask(alexa)({
          speech: 'hello world!',
          suggestions: ['world one', 'world two'],
        });

        expect(alexa.response.hint).to.have.been.calledOnce;
        expect(alexa.response.hint.args[0][0]).to.be.equal('world one');
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

      it('should start playing audio file from passed url', () => {
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

        expect(alexa.response.cardRenderer).to.have.been
          .calledWith(
            'song title',
            'some description',
            'https://archive.org/download/image.jpg'
          );

        expect(alexa.response.audioPlayerPlay).to.have.been
          .calledWith(
            'REPLACE_ALL',
            'https://archive.org/download/song.mp3',
            'https://archive.org/download/song.mp3',
            null,
            0
          );

        expect(alexa.response.hint).to.have.been.calledOnce;
        expect(alexa.response.hint.args[0][0]).to.be.equal('next song');
      });
    });
  });
});
