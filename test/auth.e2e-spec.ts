import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as crypto from 'crypto';
import { isUUID } from 'class-validator';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/createApp';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';

const generateRandomString = (size: number): string => {
  return crypto.randomBytes(size).toString('base64').slice(0, size);
};

describe('AuthController (e2e)', () => {
  let mongoMemoryServer: MongoMemoryServer;
  let app: INestApplication;
  let server: any;

  const sa = {
    login: 'admin',
    password: 'qwerty',
  };

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

  describe.skip('Registration => (POST) /auth/registration', () => {
    const url = '/auth/registration';
    it('(POST) /auth/registration => route should be defined ', async () => {
      const response = await request(server).post(url);
      expect(response).toBeDefined();
    });
  });

  describe('Create User by SA => POST => /sa/users', () => {
    const url = '/sa/users';
    it('(POST) /sa/users => route should be defined ', async () => {
      const response = await request(server).post(url);
      expect(response).toBeDefined();

      const response1 = await request(server).get(url);
      expect(response1).toBeDefined();
    });
    it('should return 401 status code because SA invalid', async () => {
      const responseWithoutAuth = await request(server).post(url);
      expect(responseWithoutAuth.status).toBe(401);

      const responseWithInvalidAuth = await request(server)
        .post(url)
        .auth('invalid', 'data');
      expect(responseWithInvalidAuth.status).toBe(401);
    });
    it('should return 400 because invalid input data', async () => {
      const errors = {
        errorsMessages: expect.arrayContaining([
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
        ]),
      };

      const firstResponse = await request(server)
        .post(url)
        .auth(sa.login, sa.password)
        .send({});

      expect(firstResponse.status).toBe(400);
      expect(firstResponse.body).toStrictEqual(errors);

      const secondCreateUserDto: CreateUserDto = {
        login: '',
        email: '',
        password: '',
      };

      const secondResponse = await request(server)
        .post(url)
        .auth(sa.login, sa.password)
        .send(secondCreateUserDto);

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body).toStrictEqual(errors);
      const thirdCreateUserDto: CreateUserDto = {
        login: generateRandomString(11),
        email: generateRandomString(50),
        password: generateRandomString(21),
      };

      const thirdResponse = await request(server)
        .post(url)
        .auth(sa.login, sa.password)
        .send(thirdCreateUserDto);

      expect(thirdResponse.status).toBe(400);
      expect(thirdResponse.body).toEqual(errors);
    });
    it('should crate new user with 201 status code', async () => {
      const usersCountBeforeCreate = await request(server)
        .get(url)
        .auth(sa.login, sa.password);

      expect(usersCountBeforeCreate.status).toBe(200);
      expect(usersCountBeforeCreate.body.items).toHaveLength(0);

      const inputData: CreateUserDto = {
        login: 'login',
        password: 'password',
        email: 'anyEmail@myMail.com',
      };

      const createUserResponse = await request(server)
        .post(url)
        .auth(sa.login, sa.password)
        .send(inputData);

      expect(createUserResponse.status).toBe(201);
      const user = createUserResponse.body;
      expect(user).toStrictEqual({
        id: expect.any(String),
        login: inputData.login,
        email: inputData.email.toLowerCase(),
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });
      expect(isUUID(user.id)).toBeTruthy();

      const usersCountAfterCreate = await request(server)
        .get(url)
        .auth(sa.login, sa.password);

      expect(usersCountAfterCreate.status).toBe(200);
      expect(usersCountAfterCreate.body.items).toHaveLength(1);

      expect.setState({ user: { ...user, password: inputData.password } });
    });
    it('should ', async () => {
      const { user } = expect.getState();
    });
    //TODO: check the creation of a user with an existing login \email
  });
});
