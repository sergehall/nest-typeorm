import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app-options-db';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { SaDto } from './utilities/sa.dto';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const saCreateUserUrl = '/sa/users';

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
  }, 10000); // Increase the timeout to 10000 milliseconds (10 seconds)
  // beforeAll(async () => {
  //   const testAppOptions = await getTestAppOptions();
  //   app = testAppOptions.app;
  //   server = testAppOptions.server;
  // });
  afterAll(async () => {
    await app.close();
  });

  describe('Registration => (POST) /auth/registration', () => {
    const url = '/auth/registration';
    it('(POST) /auth/registration => route should be defined ', async () => {
      const response = await request(server).post(url);
      expect(response).toBeDefined();
    });
  });

  describe('Login Endpoint (POST) /auth/login', () => {
    let createdUser: any; // Define a variable to store the created user

    beforeAll(async () => {
      // Create a new user
      const createUserDto: CreateUserDto = {
        login: 'createUser',
        email: 'createUser@example.com',
        password: '123456789',
      };

      const createUserResponse = await request(server)
        .post(saCreateUserUrl)
        .auth(SaDto.login, SaDto.password)
        .send(createUserDto);

      expect(createUserResponse.status).toBe(201);

      createdUser = createUserResponse.body;
    });

    it('should successfully log in and return an access token', async () => {
      const loginData = {
        loginOrEmail: createdUser.login,
        password: '123456789', // Use the correct password
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        loginOrEmail: createdUser.login,
        password: 'invalidPassword', // Use an invalid password
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.accessToken).toBeUndefined();
    });
  });
});
