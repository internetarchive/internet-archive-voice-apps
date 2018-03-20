const util = require('util');

const templateResolvers = require('../../../configurator/parsers/template-resolvers');
const {debug} = require('../../../utils/logger')('ia:actions:middleware:fulfil-resolvers');

/**
 * Middleware
 *
 * mustachejs doesn't support promises on-fly
 * so we should solve all of them before mustach processing
 *
 * - solve all resolvers in speech attribute
 * - and substitute result
 */
module.exports = () =>
  /**
   * @param slots
   * @param speech
   * @returns {Promise}
   */
  args => {
    const {slots = {}, speech} = args;

    // TODO: should we be limitted by speech only?
    const template = speech;

    debug(`resolve slots for "${template}"`);
    const filledSlots = Object.keys(slots);
    const resolversToProcess = templateResolvers.getTemplateResolvers(template, filledSlots);

    debug('we get resolvers to process:', resolversToProcess);
    return Promise
      .all(
        resolversToProcess
          .map(({handler}) => handler(slots))
      )
      .then(solutions => {
        debug('solutions:', solutions);
        return solutions
        // zip/merge to collections
          .map((res, index) => {
            const resolver = resolversToProcess[index];
            return Object.assign({}, resolver, {result: res});
          })
          // pack result in the way:
          .reduce((acc, resolver) => {
            debug(`we get result resolver.result: ${util.inspect(resolver.result)} to bake for "${resolver.name}"`);
            return Object.assign({}, acc, {
              [resolver.name]: resolver.result,
            });
          }, {});
      })
      .then(newSlots => {
        return Promise.resolve(
          Object.assign({}, args, {
            slots: Object.assign({}, slots, newSlots),
          })
        );
      });
  };
