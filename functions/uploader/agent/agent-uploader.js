const axios = require('axios');
const debug = require(`debug`)(`ia:uploader:agent:agent-uploader:debug`);
const error = require(`debug`)(`ia:uploader:agent:agent-uploader:error`);
const util = require(`util`);
const {getAccessToken} = require('../utils/get-access-token');
const {prepareAgentToPostToDF} = require('../utils/prepare-agent');

const config = require('../config');
const mustache = require('mustache');

function uploadAgent () {
  return Promise.all([getAccessToken(), prepareAgentToPostToDF('../../agent', './')])
    .then(values => {
      const [accessToken, base64] = values;
      var agentId = config.agent.ID;
      return axios(mustache.render(
        config.dfendpoints.AGENT_IMPORT_URL,
        {
          agentId,
          accessToken,
        }
      ), {headers: {'content-type': `application/json; charset=UTF-8`}, method: `POST`, data: JSON.stringify({'agentContent': base64})});
    })
    .then(res => res.data)
    .then(data => {
      debug(util.inspect(data, false, null));
    })
    .catch(e => {
      error(`Get error in uploading agent from DF, error: ${e}`);
      return Promise.reject(e);
    });
}

module.exports = {
  uploadAgent,
};
