module.exports = {
  // v2
  acknowledger: [
    'OK, ',
    'Got it, ',
    'Sure, ',
    'Alright, ',
    'Thanks, '
  ],

  dialog: {
    playSong: {
      description: 'Playing track - {{title}}, {{coverage}}, {{year}}',
      title: 'Playing track number - {{track}}',
      suggestionLink: 'on Archive.org',
    }
  },

  intents: {
    musicQuery: {
      acknowledges: [
        '{{coverage}} - good place!',
        `Excellent! You've selected {{collectionId}} collection.`,
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'Ok! Lets go with {{__resolvers.creator.title}} band!',
        `You've selected {{__resolvers.collection.title}}`,
      ],

      prompts: [{
        requirements: [
          'collectionId'
        ],

        prompts: [
          'Would you like to listen to music from our collections of {{suggestions.humanized}}?',
        ],

        suggestions: [
          '78s',
          'Live Concerts',
        ],
      }, {
        requirements: [
          'creatorId'
        ],

        prompts: [
          'What artist would you like to listen to? For example, {{suggestions.humanized}}?',
        ],
      }, {
        requirements: [
          'coverage',
          'year',
        ],

        prompts: [
          'Do you have a specific city and year in mind, like {{suggestions.values.0}}, or would you like me to play something randomly?',
        ],
      }],

      slots: {
        'collectionId': {},
        'creatorId': {},
        'coverage': {},
        'year': {},
      },

      fulfillment: 'albums',
    },

    noInput: [{
      speech: "Sorry, I couldn't hear you.",
    }, {
      speech: 'Sorry, can you repeat that? {{reprompt}}',
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    unknown: [{
      speech: "I'm not sure what you said. Can you repeat that?",
    }, {
      speech: "I still didn't get that. {{reprompt}}",
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    selectCreator: {
      speech: '{{title}} - great choice!',
      prompts: {
        coverageAndYear: {
          speech: `Do you have a specific city and year in mind, like {{suggestions}}, or would you like me to play something random?`,
          suggestion: '{{coverage}} {{year}}',
        }
      }
    },

    welcome: {
      speech: 'Would you like to listen to music from our collections of 78s or Live Concerts?',
      suggestions: ['78s', 'Live Concerts']
    },

    selectCollection: {
      speech: 'Ok, you selected {{title}}, what artist would you like to listen to?  For example, the Grateful Dead, the Ditty Bops or the Cowboy Junkies.',
      suggestions: ['Grateful Dead', 'Ditty Bops', 'Cowboy Junkies']
    }
  },

  prompts: {
    select: {
      artist: [
        'What artist do you want to hear?',
        'What artist would you like to listen to?',
      ],
      city: 'Please select a city',
      collection: 'Please select a collection',
      topic: [
        'Please select a topic',
        'Please select a topic - like Jazz, Alternative, or Dance',
      ],
      year: 'Please select a year',
      yearAndCity: [
        'Please select a city and year',
        'Do you have a specific city and year in mind?',
      ],
    },
  },

  // v1
  appExit: "Okay, let's try this again later.",
  errors: {
    device: {
      mediaResponse: {
        speech: "Sorry, your device doesn't support media response.",
      },
    },
    noInput: {
      first: "Sorry, I couldn't hear you.",
      reprompt: 'Sorry, can you repeat that?'
    },
    unknownInput: {
      first: "I'm not sure what you said. Can you repeat that?",
      reprompt: "I still didn't get that."
    },
    collection: {
      notFound: 'has no available songs to play. Please choose a different artist, random is also an option'
    },
    topic: {
      notFound: "I couldn't find any songs. Please select another topic, random is also an option"
    },
    yearAndCity: {
      notFound: "I couldn't find any songs. Try a different city or year, random is also an option"
    },
    yearList: {
      notFound: "I wasn't able to find a year list. Please select random"
    }
  },
  fallback: {
    whatWasThat: 'Sorry, what was that?',
    didntCatchThat: "I didn't catch that.",
    misunderstand: "I'm having trouble understanding you",
    sayAgain: 'Sorry, can you say that again?',
    finalReprompt: "I'm sorry I'm having trouble here. Maybe we should try this again later."
  },
  suggestion: {
    artist: {
      gratefulDead: 'Grateful Dead',
      cowboyJunkies: 'Cowboy Junkies',
      dittyBops: 'Ditty Bops',
      discoBiscuits: 'Disco Biscuits',
      hotButteredRum: 'Hot Buttered Rum',
      kellerWilliams: 'Keller Williams'
    },
    artistsPrompt: 'I have some music from The Ditty Bops, Cowboy Junkies, and Grateful Dead, for example',
    artistsPromptAlternative: 'We also have music from Disco Biscuits, Hot Buttered Rum, and Keller Williams',
    randomPrompt: 'I can play something randomly'
  },
  statements: {
    greeting: {
      welcome: {
        liveMusicCollection: 'Welcome to the live music collection at the Internet Archive.'
      },
      welcomeBack: 'Welcome to the live music collection at the Internet Archive.'
    },
    salutation: {
      thankYou: {
        liveMusicCollection: 'Thanks for rocking with the Internet Archive’s live music collection!'
      }
    }
  }
};
