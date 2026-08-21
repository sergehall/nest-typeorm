import { INestApplication } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Server } from 'node:http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { getTestAppOptions, resetTestDatabase } from './utilities/get-test-app.options';
import {
  getResponseBody,
  getValidationErrorFields,
  parsePaginator,
  parseTestUser,
  parseTestUserRecord,
} from './utilities/http-response.utils';
import { MockUserCredentials } from './utilities/mock-test-data';
import TestUtils from './utilities/test.utils';

const USER_INPUT = {
  login: 'newUser',
  password: 'password123',
  email: 'new-user@example.com',
} as const satisfies CreateUserDto;

describe('Super Admin API (e2e)', () => {
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

  it('requires valid Basic authentication', async () => {
    const missingAuthResponse = await request(server)
      .post('/sa/users')
      .send(USER_INPUT)
      .expect(401);
    expect(getValidationErrorFields(getResponseBody(missingAuthResponse))).toContain(
      'headers.authorization',
    );

    const invalidAuthResponse = await request(server)
      .post('/sa/users')
      .auth('invalid', 'credentials')
      .send(USER_INPUT)
      .expect(401);
    expect(getValidationErrorFields(getResponseBody(invalidAuthResponse))).toContain(
      'headers.authorization',
    );
  });

  it('returns field-level errors for invalid user input', async () => {
    const emptyResponse = await request(server)
      .post('/sa/users')
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send({})
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(emptyResponse))).toEqual(
      expect.arrayContaining(['login', 'email', 'password']),
    );

    const boundaryResponse = await request(server)
      .post('/sa/users')
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send({
        login: 'login-is-too-long',
        email: 'not-an-email',
        password: 'password-is-more-than-twenty-characters',
      })
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(boundaryResponse))).toEqual(
      expect.arrayContaining(['login', 'email', 'password']),
    );
  });

  it('supports create, query, retrieve, duplicate-check, and delete behavior', async () => {
    const createdUser = await testUtils.createUser(USER_INPUT);

    expect(createdUser).toMatchObject({
      login: USER_INPUT.login.toLowerCase(),
      email: USER_INPUT.email.toLowerCase(),
    });
    expect(isUUID(createdUser.id)).toBe(true);
    expect(Date.parse(createdUser.createdAt)).not.toBeNaN();

    const usersResponse = await request(server)
      .get('/sa/users?searchLoginTerm=new&pageNumber=1&pageSize=5')
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .expect(200);
    const users = parsePaginator(getResponseBody(usersResponse), parseTestUser);

    expect(users).toMatchObject({ page: 1, pageSize: 5, totalCount: 1 });
    expect(users.items).toEqual([createdUser]);

    const retrievedUserResponse = await request(server).get(`/users/${createdUser.id}`).expect(200);
    expect(parseTestUserRecord(getResponseBody(retrievedUserResponse))).toMatchObject(createdUser);

    const duplicateResponse = await request(server)
      .post('/sa/users')
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send(USER_INPUT)
      .expect(400);
    expect(getValidationErrorFields(getResponseBody(duplicateResponse))).toEqual(
      expect.arrayContaining(['login', 'email']),
    );

    await request(server)
      .delete(`/sa/users/${createdUser.id}`)
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .expect(204);
    await request(server).get(`/users/${createdUser.id}`).expect(404);
  });

  it('blocks login while a user is banned and restores it after unbanning', async () => {
    const createdUser = await testUtils.createUser(USER_INPUT);

    await request(server)
      .put(`/sa/users/${createdUser.id}/ban`)
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send({
        isBanned: true,
        banReason: 'Repeated violation of platform rules.',
      })
      .expect(204);

    await request(server)
      .post('/auth/login')
      .send({ loginOrEmail: createdUser.login, password: USER_INPUT.password })
      .expect(401);

    await request(server)
      .put(`/sa/users/${createdUser.id}/ban`)
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send({
        isBanned: false,
        banReason: 'The user has completed the account review.',
      })
      .expect(204);

    await request(server)
      .post('/auth/login')
      .send({ loginOrEmail: createdUser.login, password: USER_INPUT.password })
      .expect(200);
  });
});
