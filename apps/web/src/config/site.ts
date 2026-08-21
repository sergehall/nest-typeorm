export const siteConfig = {
  name: 'NestLab',
  title: 'NestLab — an educational full-stack platform',
  description:
    'An educational full-stack platform built with NestJS, Next.js, TypeScript, TypeORM, and PostgreSQL.',
  repositoryUrl: 'https://github.com/SergeHall/nest-typeorm',
  instagramUrl: 'https://www.instagram.com/sergioartg/',
} as const;

export function getApiUrl(): string {
  return process.env.API_URL ?? 'http://localhost:5005';
}
