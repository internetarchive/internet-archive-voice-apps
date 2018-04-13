const sinon = require('sinon');
const dialog = require('../../../../src/dialog');

module.exports = () => Object.assign({}, dialog, {
  ask: sinon.spy(),
});
