const intentStrings = require('../strings').intents.inOneGoArtistPlaybay;

const inOneGo = require('./helpers/in-one-go');

module.exports = inOneGo.build(intentStrings);
