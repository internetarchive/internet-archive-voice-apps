const { expect } = require('chai');

const handlerInputMock = require('../../../_utils/mocking/platforms/alexa/handler-input');
const ask = require('../../../../src/platform/alexa/response');

describe('platform', () => {
  describe('alexa', () => {
    describe('response', () => {
      let handlerInput;

      beforeEach(() => {
        handlerInput = handlerInputMock();
      });

      it('should speak speech argument', () => {
        ask(handlerInput)({ speech: 'hello world!' });
        expect(handlerInput.responseBuilder.speak).to.have.been
          .calledWith('hello world!');
      });

      // I received error, when tried to send more then one hint:
      // The skill's response must not contain more than 1 Hint directive(s) for this request type.
      it('should hint suggestions. And only one because of Alexa limitation', () => {
        ask(handlerInput)({
          speech: 'hello world!',
          suggestions: ['world one', 'world two'],
        });

        expect(handlerInput.responseBuilder.addHintDirective).to.have.been.calledOnce;
        expect(handlerInput.responseBuilder.addHintDirective.args[0][0]).to.be.equal('world one');
      });

      it('should unpack array of speeaches', () => {
        ask(handlerInput)({
          speech: [
            `Well, there ain't nobody safer than someone who doesn't care.`,
            `And it isn't even lonely when no one's ever there.`,
          ],
        });

        expect(handlerInput.responseBuilder.speak).to.have.been
          .calledWith(
            `Well, there ain't nobody safer than someone who doesn't care.\n` +
            `And it isn't even lonely when no one's ever there.`
          );
      });

      it('should stop listen when we start playing the audio', () => {
        ask(handlerInput)({
          speech: [
            'Great choice!',
            `Let's play song Title`,
          ],
          media: [{
            name: 'song title',
            description: 'some description',
            contentURL: 'https://archive.org/download/song.mp3',
            imageURL: 'https://archive.org/download/image.jpg',
            offset: 0,
          }],
          suggestions: [
            'next song',
            {
              url: 'https://archive.org/details/etree',
              title: 'on Archive.org'
            },
          ],
        });

        expect(handlerInput.responseBuilder.withShouldEndSession).to.have.been.calledWith(true);
      });

      it('should start playing audio file from passed url', () => {
        ask(handlerInput)({
          speech: [
            'Great choice!',
            `Let's play song Title`,
          ],
          media: [{
            name: 'song title',
            description: 'some description',
            contentURL: 'https://archive.org/download/song.mp3',
            imageURL: 'https://archive.org/download/image.jpg',
            offset: 0,
          }],
          suggestions: [
            'next song',
            {
              url: 'https://archive.org/details/etree',
              title: 'on Archive.org'
            },
          ],
        });

        expect(handlerInput.responseBuilder.speak).to.have.been
          .calledWith(
            'Great choice!\n' +
            `Let's play song Title`
          );

        expect(handlerInput.responseBuilder.withStandardCard).to.have.been
          .calledWith(
            'song title',
            'some description',
            'https://archive.org/download/image.jpg'
          );

        expect(handlerInput.responseBuilder.addAudioPlayerPlayDirective).to.have.been
          .calledWith(
            'REPLACE_ALL',
            'https://archive.org/download/song.mp3',
            'https://archive.org/download/song.mp3',
            0,
            null
          );

        expect(handlerInput.responseBuilder.addHintDirective).to.have.been.calledOnce;
        expect(handlerInput.responseBuilder.addHintDirective.args[0][0]).to.be.equal('next song');
      });

      it('should pass token of previous track and enqueue to stream', () => {
        ask(handlerInput)({
          media: [{
            name: 'song title',
            description: 'some description',
            contentURL: 'https://archive.org/download/new-track.mp3',
            imageURL: 'https://archive.org/download/image.jpg',
            offset: 12345,
            previousTrack: {
              contentURL: 'https://archive.org/download/old-track.mp3',
            },
          }],
        });

        expect(handlerInput.responseBuilder.addAudioPlayerPlayDirective).to.have.been
          .calledWith(
            'ENQUEUE',
            'https://archive.org/download/new-track.mp3',
            'https://archive.org/download/new-track.mp3',
            12345,
            'https://archive.org/download/old-track.mp3'
          );
      });
    });
  });
});
