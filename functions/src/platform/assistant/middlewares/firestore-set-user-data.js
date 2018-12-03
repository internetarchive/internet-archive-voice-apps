/**
 *
 * Store user's data and session to firestore
 *
 * @param db
 * @returns {Function}
 */
module.exports = (db) => (conv) => {
  const firestore = conv.firestore;
  delete conv.firestore;
  const [userData, sessionData] = firestore;

  // we are not waiting until data will be stored
  Promise.all([
    db.collection('users').doc(userData.id).set(userData),
    db.collection('sessions').doc(sessionData.id).set(sessionData),
  ]).then(() => {

  });
};
