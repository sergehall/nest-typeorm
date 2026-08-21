import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getTestAppOptions, resetTestDatabase } from './utilities/get-test-app.options';
import {
  getResponseBody,
  getValidationErrorFields,
  parseAccessToken,
} from './utilities/http-response.utils';
import { MockConfirmedUser, MockTestUser } from './utilities/mock-test-data';
import TestUtils from './utilities/test.utils';

describe('Auth API (e2e)', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let server: Server;
  let testUtils: TestUtils;

  beforeAll(async () => {
    const testContext = await getTestAppOptions();
    app = testContext.app;
    dataSource = testContext.dataSource;
    server = testContext.server;
    testUtils = new TestUtils(server);
  });

  beforeEach(async () => {
    await resetTestDatabase(dataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects an invalid registration payload with field-level errors', async () => {
    const response = await request(server).post('/auth/registration').send({}).expect(400);

    expect(getValidationErrorFields(getResponseBody(response))).toEqual(
      expect.arrayContaining(['login', 'email', 'password']),
    );
  });

  it('logs in a valid user and returns secure token contracts', async () => {
    const user = await testUtils.createTestUser();

    const response = await request(server)
      .post('/auth/login')
      .set('User-Agent', 'nest-typeorm-e2e')
      .send({ loginOrEmail: user.login, password: MockTestUser.password })
      .expect(200);

    expect(parseAccessToken(getResponseBody(response))).toBeTruthy();
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/^refreshToken=.*HttpOnly.*Secure/)]),
    );
  });

  it('rejects invalid credentials without exposing an access token', async () => {
    const user = await testUtils.createTestUser();
    const response = await request(server)
      .post('/auth/login')
      .send({ loginOrEmail: user.login, password: 'invalidPassword' })
      .expect(401);

    expect(getResponseBody(response)).not.toHaveProperty('accessToken');
    expect(getValidationErrorFields(getResponseBody(response))).toContain(
      'headers.authorization or password',
    );
  });

  it('protects the current-user profile and returns the authenticated identity', async () => {
    await request(server).get('/auth/me').expect(401);

    const user = await testUtils.createTestUser();
    const accessToken = await testUtils.getAccessToken();

    await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        userId: user.id,
        login: user.login,
        email: user.email,
      });
  });

  it('rejects email resending for an already confirmed user', async () => {
    await testUtils.createTestConfirmedUser();

    const response = await request(server)
      .post('/auth/registration-email-resending')
      .send({ email: MockConfirmedUser.email })
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(response))).toContain('email');
  });

  it('rejects a missing confirmation code with the public validation contract', async () => {
    const response = await request(server)
      .post('/auth/registration-confirmation')
      .send({})
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(response))).toContain('code');
  });
});
