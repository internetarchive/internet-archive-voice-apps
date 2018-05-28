const {expect} = require('chai');
const debug = require('debug');
const rewire = require('rewire');
const sinon = require('sinon');

const logger = rewire('../../src/utils/logger');

describe('utils', () => {
  describe('logger', () => {
    describe('time', () => {
      let consoleMock;

      beforeEach(() => {
        consoleMock = {
          info: sinon.spy(),
          warn: sinon.spy(),
        };
        logger.__set__('console', consoleMock);

        debug.enable('ia:*');
      });

      afterEach(() => {
        debug.enable(debug.load());
      });

      it('should log timer', () => {
        const {timer} = logger('ia:tests:utils');
        const stop = timer.start('hello world');
        stop();

        expect(consoleMock.info).to.be.called;
        expect(consoleMock.info.args[0][0]).to.include('ia:tests:utils:performance');
        expect(consoleMock.info.args[0][1]).to.include('hello world');
      });

      it('should warn if we try to apply the same timer twice, without stoping previous', () => {
        const {timer} = logger('ia:tests:utils');
        timer.start('hello world');
        timer.start('hello world');

        expect(consoleMock.warn).to.be.called;
      });
    });
  });
});
