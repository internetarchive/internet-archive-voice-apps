module.exports = {
  dfendpoints: {
    DF_ENTITY_POST_URL: 'https://dialogflow.googleapis.com/v2/projects/internet-archive/agent/entityTypes/{{entityid}}/entities:batchUpdate?access_token={{accesstoken}}',
    uploader: {
      collection: {
        ID: 'etree',
        FIELD: 'creator',
        LIMIT: 30000,
        ENTITY: 'testing-collection',
        ENTITY_ID: 'ENTITY_ID will goes here',
      },
      genres: {
        ID: 'georgeblood',
        FIELD: 'subject',
        LIMIT: 30000,
        ENTITY: 'testing-genres',
        ENTITY_ID: 'ENTITY_ID will goes here',
      },
    },
  },
};
