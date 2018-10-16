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

const _ = require('lodash');

const {group, SubGroup} = require('./helpers');

const queryGroup = group('query');
const skippedGroup = new SubGroup('skipped', queryGroup, []);
const valuesGroup = new SubGroup('values', queryGroup, {});

/**
 * Slot name is filled
 *
 * @param app
 * @param {String} name
 * @returns {boolean}
 */
function hasSlot (app, name) {
  return name in valuesGroup.getData(app) || skippedGroup.getData(app).indexOf(name) >= 0;
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
  return valuesGroup.getData(app)[name];
}

/**
 * Get all slots
 *
 * @param app
 * @returns {*}
 */
function getSlots (app) {
  const values = Object.assign({}, valuesGroup.getData(app));
  const skipped = skippedGroup.getData(app);
  for (let slotName of skipped) {
    delete values[slotName];
  }
  return values;
}

/**
 * reset slot
 *
 * @param app
 * @param {String} name
 */
function resetSlot (app, name) {
  const slots = Object.assign({}, valuesGroup.getData(app));
  delete slots[name];
  valuesGroup.setData(app, slots);
  const skipped = skippedGroup.getData(app);
  skippedGroup.setData(app, _.pull(skipped, name));
}

/**
 * reset all slot
 *
 * @param app
 */
function resetSlots (app) {
  skippedGroup.setData(app, []);
  valuesGroup.setData(app, {});
}

/**
 * Update slot name
 *
 * @param app
 * @param {String} name
 * @param value
 */
function setSlot (app, name, value) {
  valuesGroup.setData(app, Object.assign({}, valuesGroup.getData(app), {
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
  let skipped = skippedGroup.getData(app);
  if (skipped.indexOf(name) < 0) {
    skipped = skipped.concat(name);
  }

  skippedGroup.setData(app, skipped);
}

module.exports = {
  hasSlot,
  hasSlots,
  getSlot,
  getSlots,
  resetSlot,
  resetSlots,
  setSlot,
  skipSlot,
};
