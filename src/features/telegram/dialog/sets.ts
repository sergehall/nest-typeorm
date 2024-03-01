export type DialogResponse = string;
export type DialogSets = Array<[string[], string]>;

export const dialogSets: DialogSets = [
  [
    [
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
    'Hello, {nameRecipient}! How are you today?',
  ],
  [
    [
      'time',
      'current time',
      'what time is it?',
      'what time is it',
      "what's the time",
      "what's the time?",
      'current hour',
    ],
    `The current ${new Date().toTimeString()}.`,
  ],
  [
    [
      'mood',
      'how are you feeling',
      "how's your mood",
      "how's your mood?",
      'feeling today',
      'emotional state',
    ],
    `I'm feeling great today, thank you for asking!`,
  ],
  [
    [
      'weather',
      "how's the weather",
      "how's the weather?",
      'forecast',
      "what's the weather like",
      'weather report',
    ],
    `The weather is currently sunny.`,
  ],
  [
    [
      'good morning',
      'morning',
      'top of the morning',
      'morning greeting',
      'rise and shine',
    ],
    `Good morning, {nameRecipient}!`,
  ],
  [
    [
      'good evening',
      'evening',
      'evening greeting',
      'greeting at night',
      'night greeting',
    ],
    `Good evening, {nameRecipient}!`,
  ],
  [
    [
      'how are you doing',
      "how's it going",
      "what's up",
      "what's happening",
      "how's life",
    ],
    `I'm doing well, thank you for asking, {nameRecipient}.`,
  ],
  [
    ['thank you', 'thanks', 'appreciate it', 'thanks a lot', 'thankful'],
    `You're welcome, {nameRecipient}!`,
  ],
  [
    ['goodbye', 'bye', 'farewell', 'see you later', 'take care'],
    `Goodbye, {nameRecipient}! Take care.`,
  ],
  [
    [
      "what's new",
      'any news',
      "what's happening",
      'latest updates',
      "what's going on",
    ],
    `Nothing much is new, {nameRecipient}.`,
  ],
  [
    [
      "how's work",
      'work going well',
      "how's the job",
      'job going well',
      'work update',
    ],
    `Work is going fine, {nameRecipient}.`,
  ],
  [
    [
      "how's family",
      'family doing well',
      "how's everyone",
      'family update',
      'family news',
    ],
    `Family is doing well, {nameRecipient}.`,
  ],
  [
    [
      "what's for dinner",
      'dinner plans',
      "what's cooking",
      'meal planning',
      'dinner time',
    ],
    `I'm not sure yet, {nameRecipient}.`,
  ],
  [
    [
      "how's your day",
      'day going well',
      "how's everything",
      'daily check-in',
      "how's your day been",
    ],
    `My day is going well, {nameRecipient}.`,
  ],
  [
    [
      "how's school",
      'school going well',
      "how's studies",
      'school update',
      'learning going well',
    ],
    `School is going well, {nameRecipient}.`,
  ],
  // Добавьте еще диалоговые наборы при необходимости
];
