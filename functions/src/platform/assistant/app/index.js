const _ = require('lodash');

const {debug} = require('../../../utils/logger')('ia:platform:assistant:app');

const params = require('../parameters');
const persistance = require('../persistence');
const response = require('../response');

/**
 * Facade of Actions of Google App
 */
class App {
  constructor (conv) {
    this.conv = conv;

    this.platform = 'assistant';

    // define interfaces
    this.params = params(conv);
    this.persist = persistance(conv);
    this.response = response(conv);
  }

  /**
   * is first skill used time
   *
   * @returns {boolean}
   */
  isFirstTry () {
    return !!this.conv.user.last;
  }

  /**
   * is it new speech session
   */
  isNewSession () {
    return _.get(this, 'conv.conversation.type') === 'NEW';
  }

  /**
   * Current track offset
   *
   * for the moment Action of Google doesn't support offset
   * so it's always zero
   *
   * @returns {Number}
   */
  getOffset () {
    return 0;
  }

  /**
   * return error passed from Assistant with request
   * doesn't support for the moment
   */
  getRequestError () {
    return null;
  }

  /**
   * Stop track playback
   */
  stopPlayback () {
    debug(`stop playback is not supported by google assistant`);
  }
}

module.exports = {
  App,
};
