import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/createApp';

describe('AuthController (e2e)', () => {
  let mongoMemoryServer: MongoMemoryServer;
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    // const mongoUri = mongoMemoryServer.getUri();
    process.env['ATLAS_URI'] = mongoMemoryServer.getUri();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    await mongoMemoryServer.stop();
  });

  describe('Registration => (POST) /auth/registration', () => {
    const url = '/auth/registration';
    it('(POST) /auth/registration => route should be defined ', async () => {
      const response = await request(server).post(url);
      expect(response).toBeDefined();
    });
  });
});
