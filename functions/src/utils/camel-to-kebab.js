const noneFirstUpperCaseRegex = /[A-Za-z]([A-Z])/g;
const upperCaseWithUnderscoreAheadRegex = /[A-Za-z]_([A-Z])/g;

/**
 * Convert CamelStyle to kebab-style
 *
 * @param {string} value
 * @returns {string}
 */
module.exports = (value) => {
  const camelRes = value.replace(
    noneFirstUpperCaseRegex,
    s => `${s[0]}-${s[1].toLowerCase()}`
  );
  value = camelRes[0].toLowerCase() + camelRes.slice(1);

  const underscoreRes = value.replace(
    upperCaseWithUnderscoreAheadRegex,
    s => `${s[0]}_${s[2].toLowerCase()}`
  );

  return underscoreRes;
};
