const fetch = require('node-fetch');
const mustache = require('mustache');

const config = require('../config');

/**
 * Fetch details about Album
 *
 * @param id {string} id of album
 * @returns {Promise}
 */
function fetchAlbumDetails (id) {
  return fetch(
    mustache.render(config.endpoints.COLLECTION_URL, {id})
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
 * Fetch albums of creator by id
 *
 * @param {string} creatorId
 * @param {number} [limit]
 * @param {number} [page]
 * @param {string} [sort]
 * @returns {Promise}
 */
function fetchAlbumsByCreatorId (creatorId,
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
 * Fetch new music according to search parameters
 *
 * @param {object} search - search context
 */
function fetchNewMusic (search) {
  const albumId = search.albumId;
  return fetchAlbumDetails(albumId)
    .then(album => ({
      total: album.songs.length,
      items: album.songs
        .map((song, idx) => Object.assign({}, song, {
          audioURL: getSongUrlByAlbumIdAndFileName(albumId, song.filename),
          coverage: album.coverage,
          imageURL: mustache.render(config.media.POSTER_OF_ALBUM, {albumId}),
          // TODO : add recommendations
          // suggestions: ['TODO'],
          track: idx + 1,
          year: album.year,
        })),
    }));
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
  fetchAlbumDetails,
  fetchAlbumsByCreatorId,
  fetchNewMusic,
  getSongUrlByAlbumIdAndFileName,
};
