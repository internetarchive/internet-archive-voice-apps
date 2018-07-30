const {expect} = require('chai');
const _ = require('lodash');
const rewire = require('rewire');
const sinon = require('sinon');

const builder = rewire('../../../../src/platform/alexa/handler/handlers-builder');
const {App} = require('../../../../src/platform/alexa/app');
const mockHandlerInput = require('../../../_utils/mocking/platforms/alexa/handler-input');

describe('platform', () => {
  describe('alexa', () => {
    describe('handlers builder', () => {
      let handlerInput;
      let response;

      beforeEach(() => {
        response = {
          speechOut: 'hello world!',
        };
        handlerInput = mockHandlerInput({response});
      });

      it('should return empty object for empty input', () => {
        const res = builder();
        expect(res).to.be.ok;
        expect(res).to.be.empty;
      });

      it('should return array', () => {
        const res = builder(new Map([
          ['no-input', () => {}],
          ['welcome', () => {}],
        ]));

        expect(res).to.be.ok;
        expect(res).to.be.an('array').with.length(3);
      });

      it('should capitalize expected intent name', () => {
        const res = builder(new Map([
          ['no-input', () => {}],
          ['welcome', () => {}],
        ]));

        expect(res[0]).to.have.property('canHandle');
        expect(res[0]).to.have.property('handle');
        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'NoInput'))
        ).to.be.true;
        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'Welcome'))
        ).to.be.false;

        expect(res[1]).to.have.property('canHandle');
        expect(res[1]).to.have.property('handle');
        expect(
          res[1].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'Welcome'))
        ).to.be.true;
        expect(
          res[1].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'NoInput'))
        ).to.be.false;
      });

      it('should pass alexa app as 1st argument to intent handler', () => {
        const noInputHandler = sinon.spy();
        const welcomeHandler = sinon.spy();

        const res = builder(new Map([
          ['no-input', {default: noInputHandler}],
          ['welcome', {default: welcomeHandler}],
        ]));

        const wrappedNoInputHandler = res[0].handle;
        return wrappedNoInputHandler(handlerInput)
          .then(() => {
            expect(noInputHandler).to.have.been.called;
            expect(noInputHandler.args[0][0]).to.be.an.instanceof(App);
          });
      });

      it('should catch request type', () => {
        const launchRequestHandler = sinon.spy();
        const res = builder(new Map([
          ['launch-request', launchRequestHandler],
        ]));

        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.type', 'LaunchRequest'))
        ).to.be.true;
      });

      it('should catch AMAZON specific intents', () => {
        const helpHandler = sinon.spy();
        const res = builder(new Map([
          ['help', helpHandler],
        ]));

        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'AMAZON.HelpIntent'))
        ).to.be.true;
      });

      it('should catch AudioPlayer specific type', () => {
        const playbackStartedHandler = sinon.spy();
        const res = builder(new Map([
          ['playback-started', playbackStartedHandler],
        ]));

        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.type', 'AudioPlayer.PlaybackStarted'))
        ).to.be.true;
      });

      it(`should return Response after handler`, () => {
        const noInputHandler = sinon.spy();
        const welcomeHandler = sinon.spy();

        const res = builder(new Map([
          ['no-input', {default: noInputHandler}],
          ['welcome', {default: welcomeHandler}],
        ]));

        const wrappedNoInputHandler = res[0].handle;
        return wrappedNoInputHandler(handlerInput)
          .then((res) => {
            expect(res).to.be.equal(response);
          });
      });

      it(`should drop intent underscore tail when can't find matched handler`, () => {
        const playSongHandler = sinon.spy();

        const res = builder(new Map([
          ['play-songs', {default: playSongHandler}],
        ]));

        const input = _.set(handlerInput, 'requestEnvelope.request.intent.name', 'PlaySongs_All');
        const item = res.find(e => e.canHandle());
        expect(item).to.be.not.undefined;
        expect(item).to.be.not.null;
        return item.handle(input)
          .then(() => {
            expect(playSongHandler).to.have.been.called;
          });
      });

      describe('canHandle', () => {
        it('should return false if something failed inside of it', () => {
          builder.__set__('stripAmazonIntent', () => {
            throw new Error('one error');
          });
          const logError = sinon.spy();
          builder.__set__('error', logError);
          const input = _.set(handlerInput, 'requestEnvelope.request.intent.name', 'PlaySongs_All');
          const res = builder(new Map([
            ['no-input', {default: sinon.spy()}],
            ['welcome', {default: sinon.spy()}],
          ]));

          expect(res[0].canHandle(input)).to.be.false;
          expect(logError).to.be.called;
        });
      });
    });
  });
});
