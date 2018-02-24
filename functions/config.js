module.exports = {
  endpoints: {
    ALBUMS_OF_CREATOR_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q=collection:({{creatorId}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{sort}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    COLLECTION_URL: 'https://web.archive.org/metadata/{{id}}',
    COLLECTION_ITEMS_URL: 'https://web.archive.org/advancedsearch.php?q=(collection:{{id}})&output=json',
    SONG_URL: 'https://archive.org/download/{{albumId}}/{{filename}}',
  },

  media: {
    POSTER_OF_ALBUM: 'https://archive.org/services/img/{{albumId}}',
    DEFAULT_SONG_IMAGE: 'http://archive.org/images/notfound.png',
  },
};
