/**
 * Get user's data and session from Firestore
 *
 * add unit tests to this middleware once I get response to
 * https://github.com/firebase/firebase-js-sdk/issues/1407
 * Official docs lack of information about how to tests app which uses Firestore
 *
 * @param db firestore
 * @returns {Function}
 */
module.exports = (db) => async (conv) => {
  const { userId, sessionId } = conv.user.storage;

  // get user's data and session
  const [userDoc, sessionDoc] = await Promise.all([
    db.collection('users').doc(userId),
    db.collection('sessions').doc(sessionId),
  ]);

  conv.firestore = {
    userData: userDoc.data() || {},
    sessionData: sessionDoc.data() || {},
  };
};
