import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { getAppServerModuleFixtureCleanDb } from './utilities/get-app-server-module-fixture-clean-db';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const appServerModuleFixture = await getAppServerModuleFixtureCleanDb();
    app = appServerModuleFixture.app;
    server = appServerModuleFixture.server;
  });

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
});
