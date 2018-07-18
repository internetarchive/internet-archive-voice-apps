const mustache = require('mustache');

const dialog = require('../dialog');
const fsm = require('../state/fsm');
const helpStrings = require('../strings').intents.help;

/**
 * handle version intent
 *
 * @param app
 */
function handler (app) {
  const state = fsm.getState(app);
  let speech;
  if (app.isFirstTry && app.isFirstTry()) {
    speech = helpStrings.intro;
  }

  if (!app.params) {
    switch (state) {
      case 'playback':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playback + helpStrings.endQuestion),
        });
        break;
      case 'playback-is-stoped':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playbackstopped + helpStrings.endQuestion),
        });
        break;
      case 'search-music':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.search + helpStrings.endQuestion),
        });
        break;
      default:
        dialog.ask(app, {
          speech: mustache.render(helpStrings.default),
        });
    }
  } else {
    switch (app.param) {
      case 'collection':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.collectionsInfo),
        });
        break;
      case 'player':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playerControl),
        });
        break;
      case 'search-music':
        dialog.ask(app, {
          speech: mustache.render(helpStrings.search + helpStrings.endQuestion),
        });
        break;
      default:
        dialog.ask(app, {
          speech: mustache.render(helpStrings.default),
        });
    }
  } // End of switch statement
  dialog.ask(app, Object.assign({}, helpStrings, {speech}));
}

module.exports = {
  handler,
};
