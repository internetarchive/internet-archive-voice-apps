const {expect} = require('chai');
const _ = require('lodash');
const sinon = require('sinon');

const builder = require('../../../../src/platform/alexa/handler/handlers-builder');
const {App} = require('../../../../src/platform/alexa/app');
const mockAlexa = require('../../../_utils/mocking/platforms/alexa');

describe('platform', () => {
  describe('alexa', () => {
    describe('handlers builder', () => {
      let alexa;

      beforeEach(() => {
        alexa = mockAlexa();
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
        ]), alexa);

        expect(res).to.be.ok;
        expect(res).to.be.an('array').with.length(2);
      });

      it('should capitalize expected intent name', () => {
        const res = builder(new Map([
          ['no-input', () => {}],
          ['welcome', () => {}],
        ]), alexa);

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
          ['no-input', noInputHandler],
          ['welcome', welcomeHandler],
        ]), alexa);

        const wrappedNoInputHandler = res[0].handle;
        wrappedNoInputHandler.call(alexa);
        expect(noInputHandler).to.have.been.called;
        expect(noInputHandler.args[0][0]).to.be.an.instanceof(App);
      });

      it('should catch request type', () => {
        const launchRequestHandler = sinon.spy();
        const res = builder(new Map([
          ['launch-request', launchRequestHandler],
        ]), alexa);

        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.type', 'LaunchRequest'))
        ).to.be.true;
      });

      it('should catch AMAZON specific intents', () => {
        const helpHandler = sinon.spy();
        const res = builder(new Map([
          ['help', helpHandler],
        ]), alexa);

        expect(
          res[0].canHandle(_.set({}, 'requestEnvelope.request.intent.name', 'AMAZON.HelpIntent'))
        ).to.be.true;
      });

      it.skip(`should return Response after handler`, () => {
        const noInputHandler = sinon.spy();
        const welcomeHandler = sinon.spy();

        const res = builder(new Map([
          ['no-input', noInputHandler],
          ['welcome', welcomeHandler],
        ]), alexa);

        const wrappedNoInputHandler = res['NoInput'];
        return wrappedNoInputHandler.call(alexa)
          .then((res) => {
            // expect(alexa.emit).to.have.been.calledWith(':responseReady');
          });
      });
    });
  });
});
