const admin = require('firebase-admin');
const functions = require('firebase-functions');
const lodash = require('lodash');
const moment = require('moment');


let db;

function getDB () {
  if (!db) {
    admin.initializeApp(functions.config().firebase);
    db = admin.firestore();
  }

  return db;
}

/**
 * iterate thought all inactive users and their sessions
 *
 * @param db
 * @param batchSize
 * @param callback
 * @return {Promise<void>}
 */
async function visitInactiveUsersAndTheirSessions (db, batchSize, callback) {
  const users = db.collection('users');

  const haveNotUpdatedSinceDays = _.get(functions.config(), ['cleaner', 'haveNotUpdatedSinceDays'], 7);

  // get users which wasn't active for the week
  const inactiveUsersTimeOld = new Date();
  inactiveUsersTimeOld.setDate(inactiveUsersTimeOld.getDate() - haveNotUpdatedSinceDays);

  const inactiveUsers = await users
    .where('updatedAt', '<', inactiveUsersTimeOld.getTime())
    .orderBy('updatedAt', 'asc')
    // each user has at least one session, so we share batchSize between them
    .limit(batchSize / 2)
    .get();

  for (const user of inactiveUsers.docs) {
    console.log(
      'user id:', user.id,
      'last used:', moment(user.data().updatedAt).fromNow()
    );

    let sessions = await users.doc(user.id)
      .collection('sessions')
      .limit(batchSize / 2)
      .get();

    for (const session of sessions.docs) {
      console.log(
        'session:', session.id,
        'last used:', moment(session.data().updatedAt).fromNow()
      );
      callback({ type: 'session', ref: session.ref });
    }

    callback({ type: 'user', ref: user.ref });
  }
}

/**
 * DB cleaner
 * run once in a day
 * - to clean old sessions
 * - and old users
 */
exports.cleaner = functions.pubsub.schedule('0 */1 * * *').onRun(async (context) => {
  console.log('Start clean sessions');

  const db = getDB();

  const batchSize = _.get(functions.config(), ['cleaner', 'batchSize'], 64);
  let nProcessed = 0;
  const processedTypes = {};

  let writeBatch = db.batch();
  await visitInactiveUsersAndTheirSessions(db, batchSize, ({ type, ref }) => {
    if (nProcessed < batchSize) {
      writeBatch.delete(ref);
    }
    nProcessed++;
    processedTypes[type] = (processedTypes[type] || 0) + 1;
  });

  await writeBatch.commit();

  console.log('Successfully executed del batch.');
  console.log('Planned to batch:', batchSize);
  console.log('Found ', Object.entries(processedTypes).map(([type, count]) => `${type}: ${count}`));
});
