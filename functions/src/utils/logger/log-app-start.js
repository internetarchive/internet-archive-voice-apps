const { debug } = require('./')('ia:start');
const packageJSON = require('../../../package.json');

const logEnvVariables = require('./log-env-variables');

module.exports = ({ platform, actionsMap }) => {
  const actionNames = Object.keys(actionsMap)
    .map(name => `"${name}"`)
    .join(', ');

  debug('[Start]');
  debug('-----------------------------------------');
  debug(`Node.js Version: ${process.version}`);
  debug('-----------------------------------------');
  debug(`${packageJSON.name}: ${packageJSON.version}`);
  debug('-----------------------------------------');
  debug(`We can handle actions: ${actionNames}`);
  logEnvVariables(platform);
};
