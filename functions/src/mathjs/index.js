const includes = require('./includes');
const equal = require('./equal');
const Parser = require('expr-eval').Parser;
const parser = new Parser();

// FIXME: Need to improve this code to avoid duplications
module.exports = {
  parser, // Export the parser instance
  patch: () => {
    parser.functions.equal = equal;
  },
};
