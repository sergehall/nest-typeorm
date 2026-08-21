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
    title: 'Пользователи и доступ',
    description:
      'Регистрация, JWT-сессии, восстановление пароля, роли, разрешения CASL и управление устройствами.',
    technologies: ['Passport', 'JWT', 'CASL'],
  },
  {
    number: '02',
    eyebrow: 'Publishing',
    title: 'Блоги и общение',
    description:
      'Блоги, публикации, комментарии, реакции, подписки, модерация и обмен сообщениями в реальном времени.',
    technologies: ['TypeORM', 'Socket.IO', 'S3'],
  },
  {
    number: '03',
    eyebrow: 'Learning',
    title: 'Парная викторина',
    description:
      'Подбор игроков, игровые пары, ответы, подсчёт очков, статистика и таблица лидеров.',
    technologies: ['CQRS', 'PostgreSQL', 'Jest'],
  },
  {
    number: '04',
    eyebrow: 'Integrations',
    title: 'Внешние сервисы',
    description:
      'Платежи Stripe и PayPal, Telegram-бот, email-уведомления и S3-совместимое файловое хранилище.',
    technologies: ['Stripe', 'Telegram', 'AWS SDK'],
  },
] as const;
