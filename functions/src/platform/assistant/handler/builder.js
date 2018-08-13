const {App} = require('../app');

const {storeAction} = require('../../../state/actions');
const fsm = require('../../../state/fsm');
const {debug} = require('../../../utils/logger')('ia:platform:assistant:handler:builder');

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
        const app = conv.app || new App(conv);
        const handler = fsm.selectHandler(app, handlers);
        if (typeof handler !== 'function') {
          debug('handlers:', handlers);
          throw new Error(`we don't have handler function for intent "${intent}"`);
        }
        storeAction(app, conv.action);
        return Promise.resolve(handler(app))
          .then(res => {
            debug(`end handle intent "${intent}"`);
            return res;
          });
      }
    }));
