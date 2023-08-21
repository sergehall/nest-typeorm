import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app-options-db';

describe('App Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
