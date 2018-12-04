const admin = require('firebase-admin');
const functions = require('firebase-functions');

/**
 * Connect to Firestore DB
 *
 * @returns {admin.firestore.Firestore | *}
 */
function connect () {
  admin.initializeApp(functions.config().firebase);
  return admin.firestore();
}

module.exports = { connect };
