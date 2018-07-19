const mustache = require('mustache');

const {debug} = require('../utils/logger')('ia:actions:help');
const dialog = require('../dialog');
const fsm = require('../state/fsm');
const helpStrings = require('../strings').intents.help;
const util = require('util');
/**
 * handle help intent
 *
 * @param app
 */
function handler (app) {
  debug('INSIDE HELP HANDLER: ');
  const state = fsm.getState(app);
  debug('STARTING STATE: ' + state);
  let convToken = app.conv.request.conversation.conversationToken;

  if (convToken.indexOf('help-followup') === -1) {
    debug('INSIDE INTRO');
    dialog.ask(app, {
      speech: mustache.render(helpStrings.intro),
    });
  }
  debug('PARAMETER: ' + util.inspect(app.params.getByName('help'), false, null));
  let command = app.params.getByName('help');
  if (!command) {
    debug('Inside state switch...');
    switch (state) {
      case 'playback':
        debug('Hit playback ');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playback + helpStrings.endQuestion),
        });
        break;
      case 'playback-is-stoped':
        debug('Hit playback stopped');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playbackstopped + helpStrings.endQuestion),
        });
        break;
      case 'search-music':
        debug('Hit search-music');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.search + helpStrings.endQuestion),
        });
        break;
      default:
        debug('Hit default inside state switch');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.default),
        });
    }
  } else {
    debug('Inside else switch....');
    command.toLowerCase();
    debug('COMMAND = ' + command);
    switch (command) {
      case 'collection':
        debug('Hit collections');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.collectionsInfo),
        });
        break;
      case 'player':
        debug('Hit player');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.playerControl),
        });
        break;
      default:
        debug('Hit second default');
        dialog.ask(app, {
          speech: mustache.render(helpStrings.error),
        });
    }
  } // End of switch statement
}

module.exports = {
  handler,
};
