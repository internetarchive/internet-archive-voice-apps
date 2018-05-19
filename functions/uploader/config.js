module.exports = {
  dfendpoints: {
    DF_ENTITY_GET_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}?v=20150910',
    DF_ENTITY_POST_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}/entries?v=20150910',
    DF_ENTITY_DELETE_URL: 'https://api.dialogflow.com/v1/entities/{{entityname}}?v=20150910',
    AGENT_EXPORT_URL: 'https://dialogflow.googleapis.com/v2/projects/{{agentId}}/agent:export?access_token={{accessToken}}',
    AGENT_IMPORT_URL: 'https://dialogflow.googleapis.com/v2/projects/{{agentId}}/agent:import?access_token={{accessToken}}',
  },
  agent: {
    ID: 'agent_id_will_goes_here'
  },
  uploader: {
    collection: {
      ID: 'etree',
      FIELD: 'creator',
      LIMIT: 30000,
      ENTITY: 'testing-collection',
    },
    genres: {
      ID: 'georgeblood',
      FIELD: 'subject',
      LIMIT: 30000,
      ENTITY: 'testing-genres',
    },
  },
};
