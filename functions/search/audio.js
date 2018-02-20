const fetch = require('node-fetch');

const ALBUM_URL = 'http://web.archive.org/metadata/${id}';

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

module.exports = {
  getAlbumById,
};
