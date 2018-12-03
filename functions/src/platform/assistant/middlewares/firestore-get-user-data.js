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
  const { newUser, newSession, userId, sessionId } = conv.user.storage;

  // get user's data and session
  const [userDoc, sessionDoc] = await Promise.all([
    !newUser && db.collection('users').doc(userId),
    !newSession && db.collection('sessions').doc(sessionId),
  ]);

  conv.firestore = {
    userData: userDoc.exists ? userDoc.data() : { id: userId },
    sessionData: sessionDoc.exist ? sessionDoc.data() : { id: sessionId },
  };
};
