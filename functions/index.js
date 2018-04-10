'use strict';

const {defaultActions} = require('./src/actions');
const assistantHandler = require('./src/platform/assistant/handler');
const setup = require('./src/setup');
const logAppStart = require('./src/utils/logger/log-app-start');

const actionsMap = defaultActions();

logAppStart(actionsMap);

setup();

/**
 * Action of Google Endpoint
 *
 * @type {HttpsFunction}
 */
exports.assistant = assistantHandler(actionsMap);
