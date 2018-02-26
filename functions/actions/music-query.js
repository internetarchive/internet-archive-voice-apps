const _ = require('lodash');
const mustache = require('mustache');

const dialog = require('../dialog');
const querySlots = require('../state/query');
const {getListOfRequiredSlots} = require('../slots/slots-of-template');

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
  const newNames = [];
  const newValues = {};
  const answer = {
    speech: [],
  };

  for (let slotName in slots) {
    const value = app.getArgument(slotName);
    if (value) {
      querySlots.setSlot(app, slotName, value);
      newNames.push(value);
      newValues[slotName] = value;
    }
  }

  // we get new values
  if (newNames.length > 0) {
    // find the list of greetings which match recieved slots
    const matchedGreetings = greetings
      .map(greeting => ({
        template: greeting,
        requirements: getListOfRequiredSlots(greeting)
      }))
      .filter(
        ({requirements}) => requirements.every(r => r in newNames)
      );

    // choose one
    const oneGreeting = _.sample(matchedGreetings);
    if (oneGreeting) {
      answer.speech.push(mustache.render(oneGreeting, newValues));
    }
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
