const fetch = require('node-fetch');

const ALBUM_URL = 'https://web.archive.org/metadata/${id}';
const SONG_URL = 'https://archive.org/download/${albumId}/${filename}'

/**
 * Get details about Album
 *
 * @param id {string} id of album
 */
function getAlbumById (id) {
  return fetch(ALBUM_URL.replace('${id}', id))
    .then(res => res.json())
    .then(json => {
      return {
        creator: json.metadata.creator,
        year: parseInt(json.metadata.year),
        coverage: json.metadata.coverage,
        title: json.metadata.title,
        songs: json.files
          .filter(f => f.format === 'VBR MP3' && f.creator)
          .map(f => ({
            filename: f.name,
            title: f.title,
          }))
      };
    });
}

/**
 * Get full url to song by id of album and filename of song
 *
 * @param albumId {string}
 * @param filename {string}
 * @returns {string}
 */
function getSongUrlByAlbumIdAndFileName(albumId, filename) {
  return SONG_URL
    .replace('${albumId}', albumId)
    .replace('${filename}', filename);
}

module.exports = {
  getAlbumById,
  getSongUrlByAlbumIdAndFileName,
};
