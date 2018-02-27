// TODO: we should fetch list of resolvers as we do for actions
const resolvers = {
  creator: require('./creator'),
};

function getByName (name) {
  return resolvers[name];
}

module.exports = {
  getByName,
};
