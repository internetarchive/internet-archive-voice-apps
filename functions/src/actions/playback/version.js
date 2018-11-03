const packageJSON = require('../../../package.json');

const { getLastSuggestions } = require('../../state/dialog');
const strings = require('../../strings');

const defaultHelpers = require('../_helpers');

const playbackHelpers = require('./_helpers');

module.exports = {
  handler: app => {
    return playbackHelpers.resume(
      Object.assign({},
        defaultHelpers.getSimpleResponse(
          app,
          strings.intents.version.playback,
          packageJSON,
          { suggestions: getLastSuggestions(app) }
        ),
        { app }
      )
    );
  }
};
