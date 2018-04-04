module.exports = (value) => {
  const res = value.replace(/-([a-z])/g, s => s[1].toUpperCase());
  return res[0].toUpperCase() + res.slice(1);
};
