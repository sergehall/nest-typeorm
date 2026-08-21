import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import * as argon2 from 'argon2';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { ApiControllerDocumentation } from '../decorators/api-controller-documentation.decorator';
import { setupSwagger, SwaggerEnvironment } from '../swagger';

@ApiTags('Protected documentation test')
@ApiControllerDocumentation()
@Controller('swagger-access-test')
class SwaggerAccessTestController {
  @Get()
  @ApiOkResponse({ type: String, description: 'Returns a protected contract test value.' })
  getValue(): string {
    return 'ok';
  }
}

function cookiePairs(response: request.Response): string[] {
  const values = response.headers['set-cookie'];
  const cookies = Array.isArray(values) ? values : values ? [values] : [];
  return cookies.map((cookie) => cookie.split(';', 1)[0]);
}

function csrfTokenFromHtml(html: string): string {
  const match = html.match(/name="csrfToken" value="([^"]+)"/);
  if (!match?.[1]) {
    throw new Error('CSRF token was not rendered.');
  }

  return match[1];
}

describe('Swagger access HTTP boundary', () => {
  let app: INestApplication;
  let viewerPassword: string;
  let adminPassword: string;

  beforeAll(async () => {
    viewerPassword = 'viewer-password';
    adminPassword = 'admin-password';
    const [viewerPasswordHash, adminPasswordHash] = await Promise.all([
      argon2.hash(viewerPassword, { type: argon2.argon2id }),
      argon2.hash(adminPassword, { type: argon2.argon2id }),
    ]);
    const environment: SwaggerEnvironment = {
      NODE_ENV: 'test',
      SWAGGER_ENABLED: 'true',
      SWAGGER_VIEWER_USERNAME: 'viewer',
      SWAGGER_VIEWER_PASSWORD_HASH: viewerPasswordHash,
      SWAGGER_ADMIN_USERNAME: 'admin',
      SWAGGER_ADMIN_PASSWORD_HASH: adminPasswordHash,
      SWAGGER_SESSION_SECRET: 'http-test-session-secret-with-more-than-forty-three-characters',
      SWAGGER_SESSION_TTL_SECONDS: '1200',
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [SwaggerAccessTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    setupSwagger(app, environment);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(username: string, password: string): Promise<string[]> {
    const loginPage = await request(app.getHttpServer()).get('/api/docs/login').expect(200);
    const csrfToken = csrfTokenFromHtml(loginPage.text);
    const csrfCookies = cookiePairs(loginPage);
    const loginResponse = await request(app.getHttpServer())
      .post('/api/docs/session')
      .set('Cookie', csrfCookies)
      .type('form')
      .send({ username, password, csrfToken, returnTo: '/api/docs' })
      .expect(303);

    return cookiePairs(loginResponse);
  }

  it('redirects browser navigation while returning 401 to machine-readable clients', async () => {
    await request(app.getHttpServer())
      .get('/api/docs')
      .set('Accept', 'text/html')
      .expect(303)
      .expect('Location', '/api/docs/login?returnTo=%2Fapi%2Fdocs');
    await request(app.getHttpServer())
      .get('/api/docs/openapi.json')
      .set('Accept', 'application/json')
      .expect(401);
  });

  it('gives Viewer read-only contract access without Admin UI access', async () => {
    const viewerCookies = await login('viewer', viewerPassword);

    const viewerUi = await request(app.getHttpServer())
      .get('/api/docs')
      .set('Cookie', viewerCookies)
      .expect(200);
    expect(viewerUi.text).toContain('<title>NestLab HTTP API — Viewer</title>');

    const contract = await request(app.getHttpServer())
      .get('/api/docs/openapi.json')
      .set('Cookie', viewerCookies)
      .set('Accept', 'application/json')
      .expect(200);
    expect(contract.body.paths).toHaveProperty('/swagger-access-test');

    await request(app.getHttpServer())
      .get('/api/docs/admin')
      .set('Cookie', viewerCookies)
      .set('Accept', 'text/html')
      .expect(303);
  });

  it('gives Admin access to the interactive Swagger surface', async () => {
    const adminCookies = await login('admin', adminPassword);

    const adminUi = await request(app.getHttpServer())
      .get('/api/docs/admin')
      .set('Cookie', adminCookies)
      .expect(200);
    expect(adminUi.text).toContain('<title>NestLab HTTP API — Admin</title>');
  });
});
