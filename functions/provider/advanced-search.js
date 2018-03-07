const nameToParameter = {
  coverage: 'coverage',
  creatorId: 'collection',
  collectionId: 'collection',
  subject: 'subject',
  year: 'year',
  // TODO: add other parameters
};

/**
 * Is parameter valid
 *
 * @param value
 */
const isValidParameter = (value) => (value !== undefined) && (value !== null);

function buildQueryCondition (query) {
  return Object.keys(query)
    .map(name => ({name, paramName: nameToParameter[name]}))
    .filter(
      ({name, paramName}) => paramName && isValidParameter(query[name])
    )
    .reduce(
      (acc, {name, paramName}) => {
        acc.push(`${paramName}:(${query[name]})`);
        return acc;
      },
      []
    )
    .join(' AND ');
}

module.exports = {
  buildQueryCondition,
};
