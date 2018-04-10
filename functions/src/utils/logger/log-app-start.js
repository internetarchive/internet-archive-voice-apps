const {debug} = require('./')('ia:start');

module.exports = (actionsMap) => {
  const actionNames = Array.from(actionsMap.keys())
    .map(name => `"${name}"`)
    .join(', ');

  debug('[Start]');
  debug('-----------------------------------------');
  debug(`Node.js Version: ${process.version}`);
  debug('-----------------------------------------');

  debug(`We can handle actions: ${actionNames}`);
};
