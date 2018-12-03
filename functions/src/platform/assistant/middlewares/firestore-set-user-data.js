const { debug, info, error } = require('../../../utils/logger')('ia:platform.assistant.middlewares.firestore-set-user-data');

/**
 *
 * Store user's data and session to firestore
 *
 * @param db
 * @returns {Function}
 */
module.exports = (db) => (conv) => {
  info('start');

  const firestore = conv.firestore;
  if (!conv.firestore) {
    error(`for some reasons we don't have firestore data`);
    return;
  }

  delete conv.firestore;
  const { userData, sessionData } = firestore;

  debug('store user and session data');

  // we are not waiting until data will be stored
  Promise.all([
    db.collection('users').doc(userData.id).set(userData),
    db.collection('sessions').doc(sessionData.id).set(sessionData),
  ]).then(() => {
    debug('user and session data stored');
  }, (err) => {
    error('failed to store user and/or session data', err);
  });
};
