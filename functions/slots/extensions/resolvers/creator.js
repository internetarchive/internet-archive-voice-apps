function resolve({creatorId}) {
  // TODO: fetch data to resolve creatorId to something more useful
  return Promise.resolve();
}

module.exports = {
  requirements: ['creatorId'],
  resolve,
};
