const mustache = require('mustache');
const path = require('path');

const selectors = require('../../configurator/selectors');
const dialog = require('../../dialog');
const { getLastPhrase } = require('../../state/dialog');
const { getCurrentSong } = require('../../state/playlist');
const { getSlots } = require('../../state/query');

/**
 * Substitute context to scheme
 *
 * @param scheme
 * @param ctx
 * @returns {{speech: *}}
 */
function substitute (scheme, ctx) {
  return {
    speech: mustache.render(scheme.speech, ctx),
  };
}

module.exports = {
  /**
   * Strip file name from full path to get the name of action
   *
   * @param filename {string}
   * @returns {string}
   */
  actionNameByFileName: (filename, root = path.resolve(__dirname, '..')) =>
    path.relative(root, filename.replace(path.extname(filename), '')).split(path.sep),

  substitute,

  simpleResponse: (app, scheme) => {
    const ctx = Object.assign({}, {
      last: getLastPhrase(app),
      slots: getSlots(app),
      playback: getCurrentSong(app),
    });

    dialog.ask(app, substitute(selectors.find(scheme, ctx), ctx));
  }
};
