module.exports = {
  appExit: "Okay, let's try this again later.",
  errors: {
    device: {
      mediaResponse: "Sorry, your device doesn't support media response."
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
      notFound: "has no available songs to play. Please choose a different artist, random is also an option"
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
    sayAgain: "Sorry, can you say that again?",
    finalReprompt: "I'm sorry I'm having trouble here. Maybe we should try this again later."
  },
  prompts: {
    select: {
      artist: "What artist do you want to hear?",
      artistAlternative: "What artist would you like to listen to?",
      city: "Please select a city",
      year: "Please select a year",
      yearAndCity: "Please select a city and year",
      yearAndCityAlternative: "Do you have a specific city and year in mind?",
      collection: "Please select a collection",
      topic: "Please select a topic",
      topicAlternative: "Please select a topic - like Jazz, Alternative, or Dance"
    }
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
    artistsPrompt: "I have some music from The Ditty Bops, Cowboy Junkies, and Grateful Dead, for example",
    artistsPromptAlternative: "We also have music from Disco Biscuits, Hot Buttered Rum, and Keller Williams",
    randomPrompt: "I can play something randomly"
  },
  intents: {
    noInput: {
      first: "Sorry, I couldn't hear you.",
      reprompt: 'Sorry, can you repeat that? ${reprompt}',
      fallback: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    },
    unknown: {
      first: "I'm not sure what you said. Can you repeat that?",
      reprompt: "I still didn't get that. ${reprompt}",
      fallback: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    },
    welcome: {
      speech: 'Would you like to listen to music from our collections of 78s or Live Concerts?',
      suggestions: ['78s', 'Live Concerts']
    }
  },
  statements: {
    greeting: {
      welcome: {
        liveMusicCollection: "Welcome to music at the Internet Archive."
      }, 
      welcomeBack: "Welcome back"
    },
    salutation: {
      thankYou: {
        liveMusicCollection: "Thanks for rocking with the Internet Archive’s live music collection!"
      }
    }
  }
};
