const {expect} = require('chai');

const ask = require('../../../../src/platform/assistant/response/ask');
const assistantMock = require('../../../_utils/mocking/platforms/assistant');

describe('platform', () => {
  describe('assistant', () => {
    describe('response', () => {
      describe('ask', () => {
        let assistant;

        beforeEach(() => {
          assistant = assistantMock();
        });

        it('should wrap speech to <speak> tag', () => {
          ask(assistant)({speech: 'hello world!'});
          expect(assistant.ask).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
        });

        it('should wrap speech with suggestions to <speak> tag', () => {
          ask(assistant)({
            speech: 'hello world!',
            suggestions: ['world one', 'world two'],
          });
          expect(assistant.addSimpleResponse).to.have.been.calledWith(
            '<speak>hello world!</speak>'
          );
          expect(assistant.addSuggestions).to.have.been.calledWith([
            'world one', 'world two',
          ]);
        });

        it('should unpack array of speeaches', () => {
          ask(assistant)({
            speech: [
              `Well, there ain't nobody safer than someone who doesn't care.`,
              `And it isn't even lonely when no one's ever there.`,
            ],
          });
          expect(assistant.addSuggestions).to.not.have.been.called;
          expect(assistant.addSimpleResponse).to.have.been.calledTwice;
          expect(assistant.addSimpleResponse.args[0][0]).to.be.equal(
            `<speak>Well, there ain't nobody safer than someone who doesn't care.</speak>`
          );
          expect(assistant.addSimpleResponse.args[1][0]).to.be.equal(
            `<speak>And it isn't even lonely when no one's ever there.</speak>`
          );
        });

        it('should start playing audio file from passed url', () => {
          ask(assistant)({
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

          expect(assistant.buildRichResponse).to.have.been.called;
          expect(assistant.addSimpleResponse).to.have.been.calledTwice;
          expect(assistant.addSimpleResponse.args[0][0]).to.be.equal('<speak>Great choice!</speak>');
          expect(assistant.addSimpleResponse.args[1][0]).to.be.equal(`<speak>Let's play song Title</speak>`);
          expect(assistant.addMediaResponse).to.have.been.called;
          expect(assistant.buildMediaResponse).to.have.been.called;
          expect(assistant.addMediaObjects).to.have.been.called;
          expect(assistant.buildMediaObject).to.have.been.calledWith('song title', 'https://archive.org/download/song.mp3');
          expect(assistant.setDescription).to.have.been.calledWith('some description');
          expect(assistant.setImage).to.have.been.calledWith('https://archive.org/download/image.jpg');
          expect(assistant.addSuggestions).to.have.been.calledWith(['next song']);
          expect(assistant.addSuggestionLink).to.have.been.calledWith(
            'on Archive.org',
            'https://archive.org/details/etree'
          );
        });
      });
    });
  });
});
