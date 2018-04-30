const {debug} = require('../../../utils/logger')('ia:platform:assistant:handler:builder');

const fsm = require('../../../state/fsm');

/**
 * Build list of handlers
 *
 * @param actionsMap {Map}
 */
module.exports = ({actionsMap}) =>
  Array.from(actionsMap.entries())
    .map(([intent, handlers]) => ({
      intent,
      handler: (conv) => {
        debug(`begin handle intent "${intent}"`);
        const handler = fsm.selectHandler(conv.app, handlers);
        return Promise.resolve(handler(conv.app))
          .then(res => {
            debug(`end handle intent "${intent}"`);
            return res;
          });
      }
    }));
