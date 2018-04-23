'use strict';

const {defaultActions} = require('./src/actions');
const alexaHandler = require('./src/platform/alexa/handler');
const setup = require('./src/setup');
const logAppStart = require('./src/utils/logger/log-app-start');

const actionsMap = defaultActions();

logAppStart(actionsMap);

setup({platform: 'alexa'});

/**
 * Alexa Lambda Endpoint
 *
 * @type {HttpsFunction}
 */
exports.handler = alexaHandler(actionsMap);
