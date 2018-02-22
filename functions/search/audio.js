const fetch = require('node-fetch');
const mustache = require('mustache');

const config = require('../config');

/**
 * Get details about Album
 *
 * @param id {string} id of album
 * @returns {Promise}
 */
function getAlbumById (id) {
  return fetch(
    mustache.render(config.endpoints.ALBUM_URL, {id})
  )
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
 * Get albums of creator by id
 *
 * @param creatorId {string}
 * @param [limit] {number}
 * @param [page] {number}
 * @returns {Promise}
 */
function getAlbumsByCreatorId (creatorId,
  {
    limit = 1,
    page = 1,
    sort = 'downloads+desc',
  } = {}) {
  return fetch(
    mustache.render(
      config.endpoints.ALBUMS_OF_CREATOR_URL,
      {
        creatorId,
        limit,
        page,
        sort,
        fields: 'coverage,identifier,subject,year,title'
        // fields: 'coverage,creator,description,downloads,identifier,mediatype,subject,year,location,title'
      }
    )
  )
    .then(res => res.json())
    .then(json => json.response.docs.map(a => ({
      id: a.identifier,
      name: a.coverage,
      subject: a.subject,
      title: a.title,
      year: parseInt(a.year),
    })));
}

/**
 * Get full url to song by id of album and filename of song
 *
 * @param albumId {string}
 * @param filename {string}
 * @returns {string}
 */
function getSongUrlByAlbumIdAndFileName (albumId, filename) {
  return mustache.render(config.endpoints.SONG_URL, {albumId, filename});
}

module.exports = {
  getAlbumById,
  getAlbumsByCreatorId,
  getSongUrlByAlbumIdAndFileName,
};
