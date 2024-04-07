import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app-options-db';
import TestUserUtils from './utilities/create-test-user';
import { SaUserViewModel } from '../src/features/sa/views/sa-user-view-model';

describe('Blogger Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let createdValidUser: SaUserViewModel;
  let confirmedUser: SaUserViewModel;

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
    const userUtils = new TestUserUtils(); // Create an instance of UserUtils
    createdValidUser = await userUtils.createTestUser(server);
    confirmedUser = await userUtils.createTestConfirmedUser(server);
  }, 20000); // Increase the timeout to 20000 milliseconds (20 seconds)

  afterAll(async () => {
    await app.close();
  });

  describe('Blogger Endpoint (POST) /auth/blogger', () => {
    const registrationUrl = '/auth/blogger';

    it('should be defined', async () => {
      const response = await request(server).post(registrationUrl);
      expect(response).toBeDefined();
    });
  });
});
