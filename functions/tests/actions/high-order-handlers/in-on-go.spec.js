const {expect} = require('chai');

const builder = require('../../../actions/high-order-handlers/in-one-go');

const strings = require('./fixtures/in-on-go.json');

describe('actions', () => {
  describe('high-order handlers', () => {
    describe('in one go handler', () => {
      it('should have build method', () => {
        expect(builder).to.have.property('build');
      });

      it('should create object with handler method', () => {
        expect(builder.build(strings)).to.have.property('handler');
      });
    });
  });
});
