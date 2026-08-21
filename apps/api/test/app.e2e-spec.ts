import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app.options';
import {
  assertJsonObject,
  getResponseBody,
  readNumber,
  readString,
} from './utilities/http-response.utils';

describe('Application bootstrap (e2e)', () => {
  let app: INestApplication | undefined;
  let server: Server;

  beforeAll(async () => {
    const testContext = await getTestAppOptions();
    app = testContext.app;
    server = testContext.server;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves the root endpoint', async () => {
    await request(server)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('Hello World!');
  });

  it('returns the standard error contract for an unknown route', async () => {
    const response = await request(server).get('/route-that-does-not-exist').expect(404);
    const body = getResponseBody(response);
    assertJsonObject(body);

    expect(readNumber(body, 'statusCode')).toBe(404);
    expect(readString(body, 'path')).toBe('/route-that-does-not-exist');
    expect(Date.parse(readString(body, 'timestamp'))).not.toBeNaN();
    expect(body).toHaveProperty('message');
  });
});
