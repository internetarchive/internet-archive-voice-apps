const axios = require('axios');
const debug = require(`debug`)(`ia:uploader:agent:agent-downloader:debug`);
const error = require(`debug`)(`ia:uploader:agent:agent-downloader:error`);
const {getAccessToken} = require('../utils/get-access-token');
const {prepareAgentToFetchFromDF} = require('../utils/prepare-agent');

const config = require('../config');
const mustache = require('mustache');

function downloadAgent () {
  return getAccessToken()
    .then(accessToken => {
      var agentId = config.agent.ID;
      return axios(mustache.render(
        config.dfendpoints.AGENT_EXPORT_URL,
        {
          agentId,
          accessToken,
        }
      ), {method: `POST`});
    })
    .then(res => res.data)
    .then(data => {
      debug(data);
      return prepareAgentToFetchFromDF(data.response.agentContent, '../../agent/', 'agent.zip');
    })
    .catch(e => {
      error(`Get error in downloading agent from DF, error: ${e}`);
      return Promise.reject(e);
    });
}

module.exports = {
  downloadAgent,
};
