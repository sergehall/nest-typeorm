import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app.options';

describe('App Controller (e2e)', () => {
  let app: INestApplication;

  // beforeAll(async () => {
  //   const testAppOptions = await getTestAppOptions();
  //   app = testAppOptions.app;
  // });

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
  }, 10000); // Increase the timeout to 10000 milliseconds (10 seconds)

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
