const { debug, info, error } = require('../../../utils/logger')('ia:platform.assistant.middlewares.firestore-get-user-data');


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
  info('start');

  const { newUser, newSession, userId, sessionId } = conv.user.storage;

  // get user's and session data
  try {
    const [userDoc, sessionDoc] = await Promise.all([
      !newUser && db.collection('users').doc(userId),
      !newSession && db.collection('sessions').doc(sessionId),
    ]);

    const userData = userDoc.exists ? userDoc.data() : { id: userId };
    const sessionData = sessionDoc.exist ? sessionDoc.data() : { id: sessionId };

    debug('user data', userData);
    debug('session data', sessionData);

    conv.firestore = { userData, sessionData };
  } catch (err) {
    error('fail on getting user and session data from firestore', err);
    debug('set user and session data to default');
    conv.firestore = {
      userData: { id: userId },
      sessionData: { id: sessionId },
    };
  }
};
