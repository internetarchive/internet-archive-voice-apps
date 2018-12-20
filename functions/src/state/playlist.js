const { debug, warning } = require('../utils/logger')('ia:state:playlist');

const { getData, setData } = require('./helpers').group('playlist');

class PlaylistStateError extends Error {
}

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
 * Get next song in playlist
 *
 * @param app
 * @returns {*}
 */
function getNextItem (app) {
  const playlist = getData(app);
  if (!(playlist && playlist.items)) {
    return null;
  }

  return playlist.items[_validateCurrent(app, getIndexAfterCurrent(app))];
}

/**
 * Get last song in playlist
 *
 * @param app
 * @returns {*}
 */
function getLastItem (app) {
  const playlist = getData(app);
  if (!playlist || !playlist.items || playlist.items.length === 0) {
    return null;
  }
  return playlist.items[playlist.items.length - 1];
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

/**
 * Do we have previous song
 *
 * @param app
 * @returns {boolean}
 */
function hasPreviousSong (app) {
  const playlist = getData(app);
  return !!playlist.items && playlist.current > 0;
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
 * Should we loop
 *
 * @param app
 * @returns {boolean}
 */
function isLoop (app) {
  return !!getData(app).loop;
}

/**
 * set loop on/off
 *
 * @param app
 * @param loopOn
 */
function setLoop (app, loopOn) {
  const playlist = getData(app);
  setData(app, { ...playlist, loop: loopOn });
}

/**
 * Move current position to the song
 *
 * @param app
 * @param song
 */
function moveTo (app, song) {
  debug('move to', song);
  const playlist = getData(app);
  debug('in:', playlist.items);
  const idx = playlist.items.indexOf(song);
  debug(`song index is ${idx}`);
  setData(app, { ...playlist, current: _validateCurrent(app, idx) });
  return idx;
}

/**
 * get index after current
 *
 * @param app
 * @returns {*}
 * @private
 */
function getIndexAfterCurrent (app) {
  const playlist = getData(app);
  return playlist.current + 1;
}

/**
 * validate current value
 *
 * @param value
 * @returns {*}
 * @private
 */
function _validateCurrent (app, value) {
  const playlist = getData(app);
  if (value < 0) {
    if (playlist.loop) {
      value = playlist.items.length - 1;
    } else {
      throw new PlaylistStateError(
        `Current playlist index should be more or equal to 0, but got ${value}`
      );
    }
  } else if (value >= playlist.items.length) {
    if (playlist.loop) {
      value = 0;
    } else {
      throw new PlaylistStateError(
        `Current playlist index should be less than number of items ${playlist.items.length}, but got ${value}`
      );
    }
  }

  return value;
}

/**
 * get index before current
 *
 * @param app
 * @returns {number}
 * @private
 */
function getIndexBeforeCurrent (app) {
  const playlist = getData(app);
  return playlist.current - 1;
}

/**
 * Rewind to the first item
 *
 * @param app
 */
function first (app) {
  setData(app, {
    ...getData(app),
    current: 0,
  });
}

/**
 * Reducer: Choose next song
 *
 * @param app
 */
function next (app) {
  setData(app, {
    ...getData(app),
    current: _validateCurrent(app, getIndexAfterCurrent(app)),
  });
}

/**
 * Reducer: Choose previous item
 *
 * @param app
 */
function previous (app) {
  setData(app, {
    ...getData(app),
    current: _validateCurrent(app, getIndexBeforeCurrent(app)),
  });
}

/**
 * rewind to the last item
 *
 * @param app
 */
function last (app) {
  setData(app, {
    ...getData(app),
    current: getLength(app) - 1,
  });
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
    current: _validateCurrent(app, playlist.current + value),
  }));
}

/**
 * Get Number of items
 *
 * @param app
 * @returns {number}
 */
function getLength (app) {
  return getItems(app).length;
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
 * Get playlist item by token
 *
 * @param app
 * @param token
 * @returns {*}
 */
function getItemByToken (app, token) {
  const { items } = getData(app);
  return items && items.find(i => i.audioURL === token);
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
  errors: {
    PlaylistStateError,
  },

  getCurrentSong,
  getItems,
  getItemByToken,
  getNextItem,
  getLastItem,
  isEmpty,
  isLoop,
  setLoop,
  create,
  getExtra,
  setExtra,
  getFeeder,
  setFeeder,
  hasNextSong,
  hasPreviousSong,
  moveTo,
  first,
  next,
  previous,
  last,
  shift,
  updateItems,

  PlaylistStateError
};
