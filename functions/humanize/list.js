/**
 * Converts a list of items to a human readable string
 */

function toFriendlyString (list, {ends = ' and ', delimiter = ', '} = {}) {
  const lastIndex = list.length - 1;
  return [
    list
      .splice(0, lastIndex)
      .join(delimiter),
    list[list.length - 1]
  ].join(ends);
}

module.exports = {
  toFriendlyString,
};
