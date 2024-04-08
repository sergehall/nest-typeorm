import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SaUserViewModel } from '../src/features/sa/views/sa-user-view-model';
import TestUtils from './utilities/test.utils';
import { getTestAppOptions } from './utilities/get-test-app.options';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let createdValidUser: SaUserViewModel;
  let confirmedUser: SaUserViewModel;

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;

    const userUtils = new TestUtils(); // Create an instance of UserUtils
    createdValidUser = await userUtils.createTestUser(server);
    confirmedUser = await userUtils.createTestConfirmedUser(server);
  }, 20000); // Increase the timeout to 20000 milliseconds (20 seconds)

  afterAll(async () => {
    await app.close();
  });

  describe('Registration Endpoint (POST) /auth/registration', () => {
    const registrationUrl = '/auth/registration';

    it('should be defined', async () => {
      const response = await request(server).post(registrationUrl);
      expect(response).toBeDefined();
    });

    it('should require valid user data for registration', async () => {
      // Missing required fields
      const invalidUserData = {};
      const response = await request(server)
        .post(registrationUrl)
        .send(invalidUserData);
      expect(response.status).toBe(400);
    });

    // it('should successfully register a new user with valid data', async () => {
    //   // Valid user data
    //   const validUserData = {
    //     login: 'testUser',
    //     email: 'test@example.com',
    //     password: 'password123',
    //   };
    //   const response = await request(server)
    //     .post(registrationUrl)
    //     .send(validUserData);
    //
    //   // Expect a 204 No Content response indicating successful registration
    //   expect(response.status).toBe(204);
    // });
  });

  describe('Login Endpoint (POST) /auth/login', () => {
    const authLoginUrl = '/auth/login';
    it('should successfully log in and return an access token', async () => {
      const loginData = {
        loginOrEmail: createdValidUser.login,
        password: '123456789',
      };

      const response = await request(server).post(authLoginUrl).send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        loginOrEmail: createdValidUser.login,
        password: 'invalidPassword',
      };

      const response = await request(server).post(authLoginUrl).send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.accessToken).toBeUndefined();
    });
  });

  describe('Resending email Endpoint (POST) /auth/registration-email-resending', () => {
    const resendingUrl = '/auth/registration-email-resending';

    it('should be defined', async () => {
      const response = await request(server).post(resendingUrl);
      expect(response).toBeDefined();
    });

    it('should require valid email for resending', async () => {
      // Missing required fields
      const invalidUserData = {};
      const response = await request(server)
        .post(resendingUrl)
        .send(invalidUserData);
      expect(response.status).toBe(400);
    });

    // it('should successfully resending and status 204', async () => {
    //   // Valid user data
    //   const email = { email: createdValidUser.email };
    //   const response = await request(server).post(resendingUrl).send(email);
    //
    //   expect(response.status).toBe(204);
    // });

    it('should return status 400 because user is confirmed ', async () => {
      const email = { email: confirmedUser.email };
      const response = await request(server).post(resendingUrl).send(email);

      expect(response.status).toBe(400);
    });
  });
});
