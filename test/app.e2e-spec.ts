import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppServerModuleFixtureCleanDb } from './utilities/get-app-server-module-fixture-clean-db';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const appServerModuleFixture = await getAppServerModuleFixtureCleanDb();
    app = appServerModuleFixture.app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
