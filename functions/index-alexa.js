'use strict';

const actions = require('./src/actions');
const alexaHandler = require('./src/platform/alexa/handler');
const setup = require('./src/setup');
const logAppStart = require('./src/utils/logger/log-app-start');

const actionsMap = actions.withStates();

logAppStart(actionsMap);

setup({platform: 'alexa'});

/**
 * Alexa Lambda Endpoint
 *
 * @type {HttpsFunction}
 */
exports.handler = alexaHandler(actionsMap);
