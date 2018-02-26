/**
 * Store information about search query slots,
 * which we use to fetch songs:
 *
 *
 * From happy dialog #1
 * - collectionId
 * - subject
 * - ???
 * - ??? order
 *
 *
 * From happy dialog #2
 *
 * - collectionId
 * - bandId
 * - albumId
 * - order = in original album order
 *
 *
 * From happy dialog #4
 * - collectionId
 * - bandId
 * - <null> // randomly
 * - order = random
 *
 *
 * From happy dialog #12
 * Hey Google, ask the internet archive to randomly play the Grateful Dead.
 * - collectionId = all // randomly
 * - bandId
 * - albumId = all // randomly
 * - order = random
 *
 */

const {getData, setData} = require('./helpers').group('query');

// const slotNames = [
//   'collection',
//   'subject',
//   'band',
//   'album',
//   'order',
// ];

/**
 * Slot name is filled
 *
 * @param app
 * @param {String} name
 * @returns {boolean}
 */
function hasSlot (app, name) {
  return name in getData(app);
}

/**
 * Get slot name
 *
 * @param app
 * @param {String} name
 * @returns {*}
 */
function getSlot (app, name) {
  return getData(app)[name];
}

/**
 * Update slot name
 *
 * @param app
 * @param {String} name
 * @param value
 */
function setSlot (app, name, value) {
  setData(app, Object.assign({}, getData(app), {
    [name]: value,
  }));
}

module.exports = {
  hasSlot,
  getSlot,
  setSlot,
};
