const {debug} = require('../../../utils/logger')('ia:platform:assistant:handler:builder');

/**
 * Build list of handlers
 *
 * @param actionsMap {Map}
 */
module.exports = ({actionsMap}) =>
  Array.from(actionsMap.entries())
    .map(([intent, handler]) => ({
      intent,
      handler: (conv) => {
        debug(`begin handle intent "${intent}"`);
        return Promise.resolve(handler(conv.app))
          .then(res => {
            debug(`end handle intent "${intent}"`);
            return res;
          });
      }
    }));
