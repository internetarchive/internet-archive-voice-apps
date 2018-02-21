const fetch = require('node-fetch');
const mustache = require('mustache');

const ALBUM_URL = 'https://web.archive.org/metadata/{{id}}';
const ALBUMS_OF_CREATOR_URL = 'https://web.archive.org/advancedsearch.php' +
  '?q=collection:({{creatorId}})' +
  '&fl[]=coverage,creator,description,downloads,identifier,mediatype,subject,year,location,title' +
  '&sort[]={{sort}}' +
  '&rows={{limit}}' +
  '&page={{page}}' +
  '&output=json'
const SONG_URL = 'https://archive.org/download/{{albumId}}/{{filename}}'

/**
 * Get details about Album
 *
 * @param id {string} id of album
 * @returns {Promise}
 */
function getAlbumById (id) {
  return fetch(
    mustache.render(ALBUM_URL, {id})
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
      ALBUMS_OF_CREATOR_URL,
      {creatorId, limit, page, sort}
    )
  )
    .then(res => res.json())
    .then(json => json.response.docs.map(a => ({
      id: a.identifier,
      name: a.coverage,
      subject: a.subject,
      title: a.title,
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
  return mustache.render(SONG_URL, {albumId, filename});
}

module.exports = {
  getAlbumById,
  getAlbumsByCreatorId,
  getSongUrlByAlbumIdAndFileName,
};
