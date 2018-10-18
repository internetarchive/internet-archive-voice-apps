const playlist = require('../state/playlist');
const query = require('../state/query');
const strings = require('../strings').intents.inOneGoMusicPlayback;

const inOneGo = require('./_high-order-handlers/in-one-go');

module.exports = inOneGo.build({ playlist, strings, query });
