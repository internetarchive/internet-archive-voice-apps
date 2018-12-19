const { App } = require('../app');

const { storeAction } = require('../../../state/actions');
const fsm = require('../../../state/fsm');
const { debug } = require('../../../utils/logger')('ia:platform:assistant:handler:builder');

/**
 * Build list of handlers
 *
 * @param actionsMap {Map}
 * @param after
 * @returns {{intent, handler: (function(*=): *)}[]}
 */
module.exports = ({ actionsMap, after }) =>
  Object.entries(actionsMap)
    .map(([intent, handlers]) => ({
      intent,
      handler: async (conv) => {
        debug(`begin handle intent "${intent}"`);
        const app = conv.app || new App(conv);
        const handler = fsm.selectHandler(app, handlers);
        if (typeof handler !== 'function') {
          debug('handlers:', handlers);
          throw new Error(`we don't have handler function for intent "${intent}"`);
        }
        storeAction(app, conv.action);
        const res = await handler(app);
        debug(`end handle intent "${intent}" with result ${res}`);
        await after.handle(conv);
        return res;
      }
    }));
