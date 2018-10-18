const { expect } = require('chai');
const debug = require('debug');
const rewire = require('rewire');
const sinon = require('sinon');

const logger = rewire('../../src/utils/logger');

describe('utils', () => {
  describe('logger', () => {
    describe('time', () => {
      beforeEach(() => {
        sinon.spy(console, 'info');
        sinon.spy(console, 'warn');

        debug.enable('ia:*');
      });

      afterEach(() => {
        console.info.restore();
        console.warn.restore();

        debug.enable(debug.load());
      });

      it('should log timer', () => {
        const { timer } = logger('ia:tests:utils');
        const stop = timer.start('hello world');
        stop();

        expect(console.info).to.be.called;
        expect(console.info.args[0][0]).to.include('ia:tests:utils:performance');
        expect(console.info.args[0][1]).to.include('hello world');
      });

      it('should warn if we try to apply the same timer twice, without stoping previous', () => {
        const { timer } = logger('ia:tests:utils');
        timer.start('hello world');
        timer.start('hello world');

        expect(console.warn).to.be.called;
      });
    });
  });
});
