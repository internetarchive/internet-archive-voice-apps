const {expect} = require('chai');
const traverse = require('../../src/utils/traverse');

let testJSON = {'captures': {
  '1999': {
    'text/html': 18360
  },
  '2000': {
    'application/x-director': 19,
    'video/quicktime': 1584,
    'application/x-troff-man': 1,
    'x-world/x-vrml': 1,
    'audio/x-pn-realaudio': 176,
    'audio/mpeg': 195,
    'audio/x-wav': 3098,
    'image/png': 97,
    'text/html': 901401,
    'video/x-ms-asf': 142,
    'image/gif': 17388,
    'text/plain': 394428,
    'image/jpeg': 82903,
    'application/x-shockwave-flash': 39,
    'application/zip': 108,
    'audio/x-aiff': 2767,
    'text/css': 55,
    'application/pdf': 291
  }}};

describe('utils', () => {
  describe('traverse', () => {
    it('should traverse a given object to return the sum of it\'s leaf nodes', () => {
      expect(traverse(testJSON)).to.be.equal(1423053);
    });
  });
});
