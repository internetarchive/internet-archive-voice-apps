module.exports = {
  endpoints: {
    ALBUM_DETAIL: 'https://archive.org/details/{{album.id}}',
    ALBUMS_OF_CREATOR_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q=collection:({{creatorId}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{order}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    COLLECTION_ITEMS_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q=collection:({{id}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{order}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    COLLECTION_URL: 'https://web.archive.org/metadata/{{id}}',
    QUERY_COLLECTIONS_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q={{condition}}' +
    '&fl[]={{fields}}' +
    '&sort[]={{order}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    SONG_URL: 'https://archive.org/download/{{albumId}}/{{filename}}',
  },

  media: {
    POSTER_OF_ALBUM: 'https://archive.org/services/img/{{id}}',
    DEFAULT_SONG_IMAGE: 'http://archive.org/images/notfound.png',
  },

  feeders: {
    'albums-async': {
      chunk: {
        size: 4,
      },

      defaults: {
        chunk: {
          // how many albums we would fetch in one chunk
          albums: 1,
          // how many songs we would sample in one chunk
          songs: 2,
        },
      },

      random: {
        chunk: {
          // how many albums we would fetch in one chunk
          albums: 2,
          // how many songs we would sample in one chunk
          songs: 2,
        }
      },
    }
  },
};
