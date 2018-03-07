/**
 * Sort comporators
 */
const comporators = {
  random: () => Math.random(),
};

module.exports = {
  /**
   * Sort comporator by type
   *
   * @param name
   * @return {function}
   */
  getOne: (name) => comporators[name],
};
