const { debug, warning } = require('../utils/logger')('ia:state:playlist');

const { getData, setData } = require('./helpers').group('playlist');

/**
 * Selector. Current song in the Playlist
 *
 * @param app
 * @returns {null|{id: string, title: string}}
 */
function getCurrentSong (app) {
  const playlist = getData(app);
  if (!(playlist && playlist.items)) {
    return null;
  }

  return playlist.items[playlist.current];
}

/**
 * Selector. Do we have next song
 *
 * @param app
 * @returns {boolean}
 */
function hasNextSong (app) {
  const playlist = getData(app);
  return playlist.items ? playlist.current < playlist.items.length - 1 : false;
}

function hasPreviousSong (app) {
  // TODO:
  return null;
}

/**
 * Reducer: Create new playlist
 *
 * @param app
 * @param {Array} items - new songs
 * @param {Object} [extra] - extra options
 */
function create (app, items, extra = {}) {
  const res = setData(app, Object.assign({}, getData(app), { extra }, {
    current: 0,
    items,
  }));

  if (!res) {
    if (items.length > 1) {
      debug(`get half of items and try again. from ${items.length} to ${items.length / 2}`);
      create(app, items.slice(0, items.length / 2), extra);
    } else {
      warning('there is nothing to half in items');
    }
  }
}

/**
 * get extra parameters
 *
 * @param app
 */
function getExtra (app) {
  return getData(app).extra;
}

/**
 * set extra parameters
 *
 * @param app
 * @param extra
 */
function setExtra (app, extra) {
  setData(app, Object.assign({}, getData(app), { extra }));
}

/**
 * get feeder name
 *
 * @param app
 * @returns {*}
 */
function getFeeder (app) {
  return getData(app).feederName;
}

/**
 * set feeder name
 *
 * @param app
 * @param feederName
 */
function setFeeder (app, feederName) {
  setData(app, Object.assign({}, getData(app), { feederName }));
}

/**
 * Is playlist empty
 *
 * @param app
 * @returns {boolean}
 */
function isEmpty (app) {
  const playlist = getData(app);
  return playlist.items ? playlist.items.length === 0 : true;
}

/**
 * Reducer: Choose next song
 *
 * @param app
 */
function next (app) {
  const playlist = getData(app);
  setData(app, Object.assign({}, playlist, {
    current: playlist.current + 1,
  }));
}

function previous (app) {
  // TODO:
}

/**
 * Shift current position in chunk
 *
 * @param app
 * @param value
 */
function shift (app, value) {
  const playlist = getData(app);
  setData(app, Object.assign({}, playlist, {
    current: playlist.current + value,
  }));
}

/**
 * Get playlist items
 *
 * @param app
 * @return {Array}
 */
function getItems (app) {
  return getData(app).items;
}

/**
 * update items in playlist
 *
 * @param app
 * @param items
 */
function updateItems (app, items) {
  setData(app, Object.assign({}, getData(app), {
    items,
  }));
}

module.exports = {
  getCurrentSong,
  isEmpty,
  create,
  getExtra,
  setExtra,
  getFeeder,
  setFeeder,
  hasNextSong,
  hasPreviousSong,
  next,
  previous,
  shift,
  getItems,
  updateItems,
};
