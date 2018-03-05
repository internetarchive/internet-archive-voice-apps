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

const {group, subGroup} = require('./helpers');

const {getData, setData} = group('query');
const [getSlotValues, setSlotValues] = subGroup({getData, setData}, 'values');
const [getSlotSkipped] = subGroup({getData, setData}, 'skipped', []);

/**
 * Slot name is filled
 *
 * @param app
 * @param {String} name
 * @returns {boolean}
 */
function hasSlot (app, name) {
  return name in getSlotValues(app) || getSlotSkipped(app).indexOf(name) >= 0;
}

/**
 * All slots from names are filled
 *
 * @param app
 * @param {Array} names
 * @returns {boolean}
 */
function hasSlots (app, names) {
  return names.every(name => hasSlot(app, name));
}

/**
 * Get slot name
 *
 * @param app
 * @param {String} name
 * @returns {*}
 */
function getSlot (app, name) {
  return getSlotValues(app)[name];
}

/**
 * Get all slots
 *
 * @param app
 * @returns {*}
 */
function getSlots (app) {
  const values = Object.assign({}, getSlotValues(app));
  const skipped = getSlotSkipped(app);
  for (let slotName of skipped) {
    delete values[slotName];
  }
  return values;
}

/**
 * Update slot name
 *
 * @param app
 * @param {String} name
 * @param value
 */
function setSlot (app, name, value) {
  setSlotValues(app, Object.assign({}, getSlotValues(app), {
    [name]: value,
  }));
}

/**
 * Set Slot to skipped
 *
 * @param app
 * @param {String} name
 */
function skipSlot (app, name) {
  let skipped = getData(app)._skipped || [];
  if (skipped.indexOf(name) < 0) {
    skipped = skipped.concat(name);
  }

  setData(app, Object.assign({}, getData(app), {skipped}));
}

module.exports = {
  hasSlot,
  hasSlots,
  getSlot,
  getSlots,
  setSlot,
  skipSlot,
};
