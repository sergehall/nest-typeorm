export type PlatformCapability = {
  readonly number: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
};

export const platformCapabilities: readonly PlatformCapability[] = [
  {
    number: '01',
    eyebrow: 'Identity',
    title: 'Users and access',
    description:
      'Registration, JWT sessions, password recovery, roles, CASL permissions, and device management.',
    technologies: ['Passport', 'JWT', 'CASL'],
  },
  {
    number: '02',
    eyebrow: 'Publishing',
    title: 'Publishing and communication',
    description:
      'Blogs, posts, comments, reactions, subscriptions, moderation, and real-time messaging.',
    technologies: ['TypeORM', 'Socket.IO', 'S3'],
  },
  {
    number: '03',
    eyebrow: 'Learning',
    title: 'Pair quiz',
    description: 'Player matchmaking, game pairs, answers, scoring, statistics, and leaderboards.',
    technologies: ['CQRS', 'PostgreSQL', 'Jest'],
  },
  {
    number: '04',
    eyebrow: 'Integrations',
    title: 'External services',
    description:
      'Stripe and PayPal payments, a Telegram bot, email notifications, and S3-compatible file storage.',
    technologies: ['Stripe', 'Telegram', 'AWS SDK'],
  },
] as const;
