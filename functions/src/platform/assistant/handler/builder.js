/**
 * Build list of handlers
 *
 * @param actionsMap {Map}
 */
module.exports = ({actionsMap}) =>
  Array.from(actionsMap.entries())
    .map(([intent, handler]) => ({intent, handler}));
