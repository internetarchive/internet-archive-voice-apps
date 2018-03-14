/**
 * map name of slot to request parameters
 * all missed slots will be skipped
 */
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
 * @private
 * @param value
 */
const isValidParameter = (value) => (value !== undefined) && (value !== null);

/**
 * Convert param to string
 *
 * @private
 * @param name
 * @param value
 * @returs
 */
const paramToStr = (name, value) => `${name}:(${value})`;

/**
 * Build query string by condition.
 * In case when type of condition value is Array
 * we consider it as set of options
 *
 * @param query
 */
function buildQueryCondition (query) {
  return Object.keys(query)
    .map(name => ({name, paramName: nameToParameter[name]}))
    .filter(
      ({name, paramName}) => paramName && isValidParameter(query[name])
    )
    .reduce(
      (acc, {name, paramName}) => {
        const value = query[name];
        if (Array.isArray(value)) {
          const options = value
            .map(item => paramToStr(paramName, item))
            .join(' OR ');
          acc.push(`(${options})`);
        } else {
          acc.push(paramToStr(paramName, value));
        }
        return acc;
      },
      []
    )
    .join(' AND ');
}

module.exports = {
  buildQueryCondition,
};
