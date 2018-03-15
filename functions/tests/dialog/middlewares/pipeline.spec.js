const {expect} = require('chai');
const sinon = require('sinon');

const Pipeline = require('../../../src/dialog/middlewares/pipeline');

const mockApp = require('../../_utils/mocking/app');

describe('dialog', () => {
  describe('middlewares', () => {
    let app;

    beforeEach(() => {
      app = mockApp();
    });

    describe('pipeline', () => {
      it('should process options on apply', () => {
        const options0 = {
          name: 'options0',
        };
        const options1 = {
          name: 'options1',
        };
        const options2 = {
          name: 'options2',
        };
        const middleware1 = sinon.stub().returns(options1);
        const middleware2 = sinon.stub().returns(options2);

        const pipeline = new Pipeline()
          .use(middleware1)
          .use(middleware2);

        expect(pipeline.process(app, options0)).to.be.equal(options2);
        expect(middleware1).to.be.calledWith(app, options0);
        expect(middleware2).to.be.calledWith(app, options1);
      });
    });
  });
});
