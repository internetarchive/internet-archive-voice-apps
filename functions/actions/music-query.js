const debug = require('debug')('ia:actions:music-query:debug');
const _ = require('lodash');
const mustache = require('mustache');

const dialog = require('../dialog');
const querySlots = require('../state/query');
const {
  getMatchedTemplates,
  getMatchedTemplatesExactly,
} = require('../slots/slots-of-template');

const greetings = [
  '{{coverage}} - good place!',
  '{{coverage}} {{year}} - great choice!',
  '{{year}} - it was excellent year!',
];

const slots = {
  'collection': {},
  'creator': {},
  'coverage': {},
  'year': {},
};

/**
 * handle music query action
 * - fill slots of music query
 *
 * @param app
 */
function handler (app) {
  debug('Start music query handler');

  const newNames = [];
  const newValues = {};
  const answer = {
    speech: [],
  };

  for (let slotName in slots) {
    const value = app.getArgument(slotName);
    if (value) {
      querySlots.setSlot(app, slotName, value);
      newNames.push(slotName);
      newValues[slotName] = value;
    }
  }

  debug('We get few new slots', newValues);

  // we get new values
  if (newNames.length > 0) {
    // find the list of greetings which match recieved slots
    let validGreetings = getMatchedTemplatesExactly(greetings, newNames);
    if (validGreetings.length === 0) {
      validGreetings = getMatchedTemplates(greetings, newNames);
    }

    debug('We have few valid greetings', validGreetings);

    // choose one
    const oneGreeting = _.sample(validGreetings);
    if (oneGreeting) {
      answer.speech.push(mustache.render(oneGreeting, newValues));
    }
  } else {
    // TODO: we don't get any new values
    debug(`we don't get any new values`);
  }

  if (answer.speech.length > 0) {
    dialog.ask(app, {
      speech: answer.speech.join('. '),
    });
  }
}

module.exports = {
  handler,
};
