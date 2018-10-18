/**
 * Check availability parameter and fails if it is missed
 *
 * @param param
 * @param name
 * @param message
 */
function requiredParameter (param, { name, message }) {
  if (param === undefined) {
    if (!message && name) {
      message = `${name} is missed`;
    }
    throw new Error(message);
  }
}

module.exports = {
  requiredParameter,
};
