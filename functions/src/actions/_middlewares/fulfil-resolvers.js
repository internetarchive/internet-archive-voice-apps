const util = require('util');

const templateResolvers = require('../../configurator/parsers/template-resolvers');
const { debug } = require('../../utils/logger/index')('ia:actions:middlewares:fulfil-resolvers');

/**
 * Middleware
 *
 * mustachejs doesn't support promises on-fly
 * so we should solve all of them before mustach processing
 *
 * - solve all resolvers in speech attribute
 * - and substitute result
 *
 * @returns {function({slots, speech}): *}
 */
module.exports = () => (ctx) => {
  debug('start');
  const { slots = {}, speech } = ctx;

  // TODO: should we be limitted by speech only?
  debug(`resolve slots for "${speech}"`);
  const filledSlots = Object.keys(slots);
  const resolversToProcess = templateResolvers.getTemplateResolvers(speech, filledSlots);

  debug('we get resolvers to process:', resolversToProcess);
  return Promise
    .all(
      resolversToProcess
        .map(({ handler }) => handler(ctx))
    )
    .then(solutions => {
      debug('solutions:', solutions);
      return solutions
      // zip/merge to collections
        .map((result, index) => {
          const resolver = resolversToProcess[index];
          return { ...resolver, result };
        })
        // pack result in the way:
        .reduce((acc, resolver) => {
          debug(`we get result resolver.result: ${util.inspect(resolver.result)} to bake for "${resolver.name}"`);
          return {
            ...acc,
            [resolver.name]: resolver.result,
          };
        }, {});
    })
    .then(newSlots => {
      return Promise.resolve({
        ...ctx,
        slots: { ...slots, ...newSlots },
      });
    });
};
