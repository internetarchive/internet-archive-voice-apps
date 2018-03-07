const path = require('path');

module.exports = filename => path.basename(filename, path.extname(filename));
