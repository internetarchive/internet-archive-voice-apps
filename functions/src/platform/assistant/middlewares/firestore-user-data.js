const _ = require('lodash');
const util = require('util');

const { debug, info, error, timer } = require('../../../utils/logger')('ia:platform.assistant.middlewares.firestore-user-data');
const traverse = require('../../../utils/traverse');

/**
 * Create default user
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
 * Build default session
 *
 * @param conv
 * @param id
 * @returns {*}
 */
function buildDefaultSession (conv, id) {
  debug('build default session');
  return {
    id,
    idx: 0,
    conversationId: _.get(conv, 'request.conversation.conversationId'),
    createdAt: Date.now(),
  };
}

/**
 * Update session data
 *
 * @param session
 * @returns {{idx: *}}
 */
function updateSession (session) {
  return { ...session, idx: (session.idx || 0) + 1 };
}

/**
 * return null if value is undefined
 *
 * @param value
 * @returns {null}
 */
const nullIfUndefined = (value) => value !== undefined ? value : null;

module.exports = (db) => ({
  /**
   * Start firestore middleware
   *
   * @param conv
   * @returns {Promise<void>}
   */
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
      const sessionData = sessionDoc.exists ? updateSession(sessionDoc.data()) : buildDefaultSession(conv, sessionId);

      stopFirestoreTimer();

      debug('get user data', userData);
      debug('get session data', sessionData);

      conv.firestore = { userData, sessionData };
    } catch (err) {
      error('fail on getting user and session data from firestore', err);
      debug('set user and session data to default');
      conv.firestore = {
        userData: buildDefaultUser(userId),
        sessionData: buildDefaultSession(conv, sessionId),
      };
    }
  },

  /**
   * Finish firestore middleware
   *
   * @param conv
   * @returns {Promise<void>}
   */
  async finish (conv) {
    info('finish');

    const firestore = conv.firestore;
    if (!conv.firestore) {
      error(`for some reasons we don't have firestore data`);
      return;
    }

    delete conv.firestore;
    let { userData, sessionData } = firestore;

    debug(`store user ${userData.id} and session ${sessionData.id} data`);

    const stopFirestoreTimer = timer.start('set-user-and-session-data');

    const userRef = db.collection('users').doc(userData.id);
    const sessionRef = userRef.collection('sessions').doc(sessionData.id);

    // TODO: store only when we have new data
    userData.updatedAt = Date.now();
    sessionData.updatedAt = Date.now();

    // because firebase doesn't allow undefined fields
    // we could get error:
    // failed to store user and/or session data Error: Argument "data" is not a valid Document.
    // Cannot use "undefined" as a Firestore value (found in field conversationId).

    // we should verify data before store it

    // replace all undefined values (even nested) with null
    userData = traverse(userData, nullIfUndefined);
    sessionData = traverse(sessionData, nullIfUndefined);

    try {
      await Promise.all([
        userRef.set(userData),
        sessionRef.set(sessionData),
      ]);
      debug(`user ${userData.id} and session ${sessionData.id} data stored`);
    } catch (err) {
      error(`failed to store user ${userData.id} and/or session ${sessionData.id} data`, err);
      // log data so in case of fail we would know what was the reason
      debug('failed userData', util.inspect(userData, { depth: null }));
      debug('failed sessionData', util.inspect(sessionData, { depth: null }));
    }
    stopFirestoreTimer();
  }
});
