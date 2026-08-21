export const siteConfig = {
  name: 'NestLab',
  title: 'NestLab — учебная full-stack платформа',
  description: 'Учебная full-stack платформа на NestJS, Next.js, TypeScript, TypeORM и PostgreSQL.',
  repositoryUrl: 'https://github.com/SergeHall/nest-typeorm',
  instagramUrl: 'https://www.instagram.com/sergioartg/',
} as const;

export function getApiUrl(): string {
  return process.env.API_URL ?? 'http://localhost:5005';
}
