module.exports = {
  dfendpoints: {
    DF_ENTITY_POST_URL: 'https://dialogflow.googleapis.com/v2/projects/internet-archive/agent/entityTypes/{{entityid}}/entities:batchUpdate?access_token={{accesstoken}}',
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
      ENTITY_ID: 'ENTITY_ID will goes here',
    },
    genres: {
      ID: 'georgeblood',
      FIELD: 'subject',
      LIMIT: 30000,
      ENTITY_ID: 'ENTITY_ID will goes here',
    },
  },
};
