'use strict';

const actions = require('./src/actions');
const assistantHandler = require('./src/platform/assistant/handler');
const setup = require('./src/setup');
const logAppStart = require('./src/utils/logger/log-app-start');

const actionsMap = actions.withStates();

logAppStart(actionsMap);

setup({platform: 'assistant'});

/**
 * Action of Google Endpoint
 *
 * @type {HttpsFunction}
 */
exports.assistant = assistantHandler(actionsMap);
