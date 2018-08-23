function dropBrackets (value) {
  return value.replace(/[\(,\)]/g, '');
}

module.exports = {
  dropBrackets,
};
