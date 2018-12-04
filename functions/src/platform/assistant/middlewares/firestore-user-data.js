const { debug, info, error } = require('../../../utils/logger')('ia:platform.assistant.middlewares.firestore-user-data');

module.exports = (db) => ({
  async start (conv) {
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
  },

  finish (conv) {
    info('finish');

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
  }
});
