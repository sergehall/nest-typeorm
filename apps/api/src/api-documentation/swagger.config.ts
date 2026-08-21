import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';
export const SWAGGER_JSON_PATH = '/api/docs/openapi.json';
export const SWAGGER_YAML_PATH = '/api/docs/openapi.yaml';
export const API_VERSION = '1.36.0';
export const API_OPERATION_COUNT = 98;

const swaggerTags = [
  ['App', 'Service availability and application information.'],
  ['Auth', 'Registration, login, token rotation, recovery, and current-user identity.'],
  ['Blogs', 'Public blog discovery and subscriptions.'],
  ['Posts', 'Public posts, comments, and reactions.'],
  ['Comments', 'Comment lookup, editing, deletion, and reactions.'],
  ['Blogger', 'Authenticated authoring, moderation, and image uploads.'],
  ['Users', 'User administration and profile operations.'],
  ['Security', 'Refresh-token session and device management.'],
  ['Pair-game-quiz', 'Quiz matchmaking, answers, history, and statistics.'],
  ['Super Admin', 'Super-admin user and blog governance.'],
  ['Super Admin Quiz Questions', 'Super-admin quiz question management.'],
  ['Messages', 'Conversation message operations.'],
  ['Telegram', 'Telegram webhook and account-linking integration.'],
  ['Products', 'Educational product catalog endpoints.'],
  ['Stripe', 'Stripe checkout lifecycle and provider webhook.'],
  ['Pay-pal', 'PayPal checkout lifecycle and provider webhook.'],
  ['Testing', 'Destructive test-environment maintenance operations.'],
] as const;

export function createSwaggerConfig() {
  const builder = new DocumentBuilder()
    .setTitle('NestLab HTTP API')
    .setDescription(
      'Complete OpenAPI contract for the NestLab educational backend. The API covers identity, publishing, comments, quizzes, messaging, payments, Telegram integration, and administration.',
    )
    .setVersion(API_VERSION)
    .addServer('http://localhost:5005', 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token returned by POST /auth/login.',
      },
      'access-token',
    )
    .addCookieAuth(
      'refreshToken',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'HTTP-only refresh token cookie issued during login.',
      },
      'refresh-cookie',
    )
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        description: 'Super-admin Basic authorization credentials.',
      },
      'basic',
    );

  for (const [name, description] of swaggerTags) {
    builder.addTag(name, description);
  }

  return builder.build();
}
