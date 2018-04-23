const sinon = require('sinon');

/**
 * Create group of middlewares
 *
 * @param names
 */
module.exports = (names) => {
  return names.map(name => {
    const middleware = sinon.stub().returns(Promise.resolve());
    const middlewareBuilder = sinon.stub().returns(middleware);
    middlewareBuilder.middleware = middleware;
    return {
      name,
      middleware,
      middlewareBuilder,
    };
  })
    .reduce((acc, {name, middlewareBuilder}) => {
      return Object.assign({}, acc, {[name]: middlewareBuilder});
    }, {});
};
