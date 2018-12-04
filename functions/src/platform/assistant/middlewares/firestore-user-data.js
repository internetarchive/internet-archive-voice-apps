const { debug, info, error, timer } = require('../../../utils/logger')('ia:platform.assistant.middlewares.firestore-user-data');

/**
 * create default user
 *
 * @param id
 * @returns {{id: *, createdAt: *}}
 */
function buildDefaultUser (id) {
  debug('build default user');
  return {
    id,
    createdAt: Date.now(),
  };
}

/**
 * build default session
 *
 * @param id
 * @returns {{id: *, createdAt: *}}
 */
function buildDefaultSession (id) {
  debug('build default session');
  return {
    id,
    createdAt: Date.now(),
  };
}

module.exports = (db) => ({
  async start (conv) {
    info('start');

    const { newUser, newSession, userId, sessionId } = conv.user.storage;

    // get user's and session data
    try {
      debug(`we are going to get user ${userId}`);
      debug(`we are going to get session ${sessionId}`);

      const stopFirestoreTimer = timer.start('get-user-and-session-data');

      const userRef = db.collection('users').doc(userId);
      const sessionRef = userRef.collection('sessions').doc(sessionId);

      const [userDoc, sessionDoc] = await Promise.all([
        !newUser && userRef.get(),
        !newSession && sessionRef.get(),
      ]);

      const userData = userDoc.exists ? userDoc.data() : buildDefaultUser(userId);
      const sessionData = sessionDoc.exist ? sessionDoc.data() : buildDefaultSession(sessionId);

      stopFirestoreTimer();

      debug('get user data', userData);
      debug('get session data', sessionData);

      conv.firestore = { userData, sessionData };
    } catch (err) {
      error('fail on getting user and session data from firestore', err);
      debug('set user and session data to default');
      conv.firestore = {
        userData: buildDefaultUser(userId),
        sessionData: buildDefaultSession(sessionId),
      };
    }
  },

  async finish (conv) {
    info('finish');

    const firestore = conv.firestore;
    if (!conv.firestore) {
      error(`for some reasons we don't have firestore data`);
      return;
    }

    delete conv.firestore;
    const { userData, sessionData } = firestore;

    debug('store user and session data');

    const stopFirestoreTimer = timer.start('set-user-and-session-data');

    const userRef = db.collection('users').doc(userData.id);
    const sessionRef = userRef.collection('sessions').doc(sessionData.id);

    // TODO: store only when we have new data
    userData.updatedAt = Date.now();
    sessionData.updatedAt = Date.now();

    try {
      await Promise.all([
        userRef.set(userData),
        sessionRef.set(sessionData),
      ]);
      debug('user and session data stored');
    } catch (err) {
      error('failed to store user and/or session data', err);
    }
    stopFirestoreTimer();
  }
});
