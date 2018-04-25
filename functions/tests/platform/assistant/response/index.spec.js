const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const response = rewire('../../../../src/platform/assistant/response');

const mockAssistant = require('../../../_utils/mocking/platforms/assistant');

describe('platform', () => {
  describe('assistant', () => {
    describe('response', () => {
      describe('ask', () => {
        let assistant;
        let Image;
        let LinkOutSuggestion;
        let MediaObject;
        let Suggestions;

        beforeEach(() => {
          assistant = mockAssistant();
          Image = sinon.stub().returnsArg(0);
          LinkOutSuggestion = sinon.stub().returnsArg(0);
          Suggestions = sinon.stub().returnsArg(0);
          MediaObject = sinon.stub().returnsArg(0);
          response.__set__('Image', Image);
          response.__set__('LinkOutSuggestion', LinkOutSuggestion);
          response.__set__('MediaObject', MediaObject);
          response.__set__('Suggestions', Suggestions);
        });

        it('should wrap speech to <speak> tag', () => {
          response(assistant)({speech: 'hello world!'});
          expect(assistant.ask).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
        });

        it('should response suggestions', () => {
          response(assistant)({
            speech: 'hello world!',
            suggestions: ['world one', 'world two'],
          });

          expect(assistant.ask).to.have.been.calledTwice;
          expect(Suggestions).to.have.been.calledWith([
            'world one', 'world two',
          ]);
        });

        it('should response suggested link', () => {
          response(assistant)({
            speech: 'hello world!',
            suggestions: [
              'world one',
              {
                url: 'https://archive.org/details/etree',
                title: 'on Archive.org'
              },
            ],
          });

          expect(assistant.ask).to.have.been.calledThrice;
          expect(assistant.ask).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
          expect(LinkOutSuggestion).to.have.been.calledWith({
            url: 'https://archive.org/details/etree',
            name: 'on Archive.org'
          });
        });

        it('should unpack array of close speeches', () => {
          response(assistant)({
            close: true,
            speech: [
              `Well, there ain't nobody safer than someone who doesn't care.`,
              `And it isn't even lonely when no one's ever there.`,
            ],
          });
          expect(assistant.close).to.have.been.calledTwice;
          expect(assistant.close.args[0][0]).to.be.equal(
            `<speak>Well, there ain't nobody safer than someone who doesn't care.</speak>`
          );
          expect(assistant.close.args[1][0]).to.be.equal(
            `<speak>And it isn't even lonely when no one's ever there.</speak>`
          );
        });

        it('should unpack array of speeaches', () => {
          response(assistant)({
            speech: [
              `Well, there ain't nobody safer than someone who doesn't care.`,
              `And it isn't even lonely when no one's ever there.`,
            ],
          });
          expect(assistant.ask).to.have.been.calledTwice;
          expect(assistant.ask.args[0][0]).to.be.equal(
            `<speak>Well, there ain't nobody safer than someone who doesn't care.</speak>`
          );
          expect(assistant.ask.args[1][0]).to.be.equal(
            `<speak>And it isn't even lonely when no one's ever there.</speak>`
          );
        });

        it('should start playing audio file from passed url', () => {
          response(assistant)({
            speech: [
              'Great choice!',
              `Let's play song Title`,
            ],
            media: [{
              name: 'Jazz in Paris',
              description: 'A funky Jazz tune',
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

          expect(assistant.ask).to.have.callCount(5);

          expect(Image).to.have.been.calledWith({
            url: 'https://archive.org/download/image.jpg',
            alt: 'A funky Jazz tune',
          });

          expect(MediaObject).to.have.been.calledWith({
            name: 'Jazz in Paris',
            url: 'https://archive.org/download/song.mp3',
            description: 'A funky Jazz tune',
            image: new Image({
              url: 'https://archive.org/download/image.jpg',
              alt: 'A funky Jazz tune',
            }),
          });
        });
      });
    });
  });
});
