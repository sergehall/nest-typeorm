import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppServerModuleFixtureCleanDb } from './utilities/get-app-server-module-fixture-clean-db';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  const saCreateUserUrl = '/sa/users';
  const sa = {
    login: 'admin',
    password: 'qwerty',
  };

  beforeAll(async () => {
    const appServerModuleFixture = await getAppServerModuleFixtureCleanDb();
    app = appServerModuleFixture.app;
    server = appServerModuleFixture.server;
  });

  afterAll(async () => {
    await server.close();
    await app.close();
  });

  describe('Registration => (POST) /auth/registration', () => {
    const url = '/auth/registration';
    it('(POST) /auth/registration => route should be defined ', async () => {
      const response = await request(server).post(url);
      expect(response).toBeDefined();
    });
  });

  describe('(POST) /auth/login', () => {
    it('should return a accessToken object', async () => {
      const createUserDto: CreateUserDto = {
        login: 'createUser',
        email: 'createUser@example.com',
        password: 'password123',
      };

      // Create a new user
      const createUserResponse = await request(server)
        .post(saCreateUserUrl)
        .auth(sa.login, sa.password)
        .send(createUserDto);

      expect(createUserResponse.status).toBe(201);

      const createdUser = createUserResponse.body;

      const loginUrl = '/auth/login';

      const loginData = {
        loginOrEmail: createdUser.login,
        password: createUserDto.password,
      };

      const response = await request(server)
        .post(loginUrl)
        .auth(loginData.loginOrEmail, loginData.password)
        .send(loginData);

      expect(response.status).toBe(200); // Assuming 200 OK status for successful login
      expect(response.body.accessToken).toBeDefined();
    });
  });
});
