export type DialogTemplate = {
  id: string;
  variations: string[];
  response: string;
};

export const dialogsSets: DialogTemplate[] = [
  {
    id: "I'm not sure what you mean",
    variations: [],
    response: `I'm not sure what you mean, {nameRecipient}.`,
  },
  {
    id: 'greetings',
    variations: [
      'hello',
      'hi',
      'hey',
      'howdy',
      'greetings',
      'hi there',
      'how are you today',
      'how are you today?',
      'how are you',
      'how are you?',
    ],
    response: `Hello, {nameRecipient}! How are you today?`,
  },
  {
    id: 'time',
    variations: [
      'time',
      'current time',
      'what time is it?',
      'what time is it',
      'what time',
      "what's the time",
      "what's time",
      "what's the time?",
      'current hour',
    ],
    response: `The current ${new Date().toTimeString()}.`,
  },
  {
    id: 'mood',
    variations: [
      'mood',
      'how are you feeling',
      "how's your mood",
      "how's your mood?",
      'feeling today',
      'emotional state',
    ],
    response: `I'm feeling great today, thank you for asking {nameRecipient}!`,
  },
  {
    id: 'weather',
    variations: [
      'weather',
      "how's the weather",
      "how's the weather?",
      'forecast',
      "what's the weather like",
      'weather report',
    ],
    response: `The weather is currently sunny.`,
  },
  {
    id: 'good_morning',
    variations: [
      'good morning',
      'morning',
      'top of the morning',
      'morning greeting',
      'rise and shine',
    ],
    response: `Good morning, {nameRecipient}!`,
  },
  {
    id: 'good_evening',
    variations: [
      'good evening',
      'evening',
      'evening greeting',
      'greeting at night',
      'night greeting',
    ],
    response: `Good evening, {nameRecipient}!`,
  },
  {
    id: 'how_are_you_doing',
    variations: [
      'how are you doing',
      "how's it going",
      "what's up",
      "what's happening",
      "how's life",
    ],
    response: `I'm doing well, thank you for asking, {nameRecipient}.`,
  },
  {
    id: 'thank_you',
    variations: [
      'thank you',
      'thanks',
      'appreciate it',
      'thanks a lot',
      'thankful',
    ],
    response: `You're welcome, {nameRecipient}!`,
  },
  {
    id: 'goodbye',
    variations: ['goodbye', 'bye', 'farewell', 'see you later', 'take care'],
    response: `Goodbye, {nameRecipient}! Take care.`,
  },
  {
    id: 'what_is_new',
    variations: [
      "what's new",
      'any news',
      "what's happening",
      'latest updates',
      "what's going on",
    ],
    response: `Nothing much is new, {nameRecipient}.`,
  },
  {
    id: 'how_is_work',
    variations: [
      "how's work",
      'work going well',
      "how's the job",
      'job going well',
      'work update',
    ],
    response: `Work is going fine, {nameRecipient}.`,
  },
  {
    id: 'how_is_family',
    variations: [
      "how's family",
      'family doing well',
      "how's everyone",
      'family news',
      'family update',
    ],
    response: `Family is doing well, {nameRecipient}.`,
  },
  {
    id: 'what_is_for_dinner',
    variations: [
      "what's for dinner",
      'dinner plans',
      "what's cooking",
      'meal planning',
      'dinner time',
    ],
    response: `I'm not sure yet, {nameRecipient}.`,
  },
  {
    id: 'how_is_your_day',
    variations: [
      "how's your day",
      'day going well',
      "how's everything",
      'daily check-in',
      "how's your day been",
    ],
    response: `My day is going well, {nameRecipient}.`,
  },
  {
    id: 'how_is_school',
    variations: [
      "how's school",
      'school going well',
      "how's studies",
      'school update',
      'learning going well',
    ],
    response: `School is going well, {nameRecipient}.`,
  },
];
