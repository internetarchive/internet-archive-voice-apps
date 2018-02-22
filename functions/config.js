module.exports = {
  endpoints: {
    ALBUM_URL: 'https://web.archive.org/metadata/{{id}}',
    ALBUMS_OF_CREATOR_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q=collection:({{creatorId}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{sort}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    SONG_URL: 'https://archive.org/download/{{albumId}}/{{filename}}',
  },

  media: {
    DEFAULT_SONG_IMAGE: 'http://archive.org/images/notfound.png',
  },
};
