/**
 * Converts a array of items to a human readable string
 */

function toFriendlyString (list, {ends = ' and ', delimiter = ', '} = {}) {
  if (!list) {
    return '';
  }

  const lastIndex = list.length - 1;
  return [
    list
      .slice(0, lastIndex)
      .join(delimiter),
    list[list.length - 1]
  ].join(ends);
}

module.exports = {
  toFriendlyString,
};
