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
    COLLECTION_ITEMS_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q=collection:({{id}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{sort}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    QUERY_COLLECTIONS_URL: 'https://web.archive.org/advancedsearch.php' +
    '?q={{condition}}' +
    '&fl[]={{fields}}' +
    '&sort[]={{sort}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    SONG_URL: 'https://archive.org/download/{{albumId}}/{{filename}}',
    DF_ENTITY_GET_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}?v=20150910',
    DF_ENTITY_POST_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}/entries?v=20150910',
    DF_ENTITY_DELETE_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}?v=20150910',
  },

  media: {
    POSTER_OF_ALBUM: 'https://archive.org/services/img/{{id}}',
    DEFAULT_SONG_IMAGE: 'http://archive.org/images/notfound.png',
  },
};
