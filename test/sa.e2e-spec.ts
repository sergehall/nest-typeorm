import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { isUUID } from 'class-validator';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { UsersEntity } from '../src/features/users/entities/users.entity';
import { getTestAppOptions } from './utilities/get-test-app.options';
import { MockUserCredentials } from './utilities/mock-test-data';

const generateRandomString = (size: number): string => {
  return crypto.randomBytes(size).toString('base64').slice(0, size);
};

describe('Sa Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let mockUserCredentials: { login: string; password: string };

  // beforeAll(async () => {
  //   const testAppOptions = await getTestAppOptions();
  //   app = testAppOptions.app;
  //   server = testAppOptions.server;
  // });

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
    mockUserCredentials = MockUserCredentials;
  }, 20000); // Increase the timeout to 20000 milliseconds (20 seconds)

  afterAll(async () => {
    await app.close();
  });

  describe('Create User by SA => POST => /sa/users', () => {
    const saUrl = '/sa/users';
    it('(POST) /sa/users => route should be defined ', async () => {
      const response = await request(server).post(saUrl);
      expect(response).toBeDefined();
    });

    it('should return 401 status code because SA invalid', async () => {
      const responseWithoutAuth = await request(server).post(saUrl);
      expect(responseWithoutAuth.status).toBe(401);

      const responseWithInvalidAuth = await request(server)
        .post(saUrl)
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
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send({});

      expect(firstResponse.status).toBe(400);
      expect(firstResponse.body).toStrictEqual(errors);

      const secondCreateUserDto: CreateUserDto = {
        login: '',
        email: '',
        password: '',
      };

      const secondResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(secondCreateUserDto);

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body).toStrictEqual(errors);
      const thirdCreateUserDto: CreateUserDto = {
        login: generateRandomString(11),
        email: generateRandomString(50),
        password: generateRandomString(21),
      };

      const thirdResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(thirdCreateUserDto);

      expect(thirdResponse.status).toBe(400);
      expect(thirdResponse.body).toEqual(errors);
    });

    it('should crate new user with 201 status code', async () => {
      const usersCountBeforeCreate = await request(server)
        .get(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password);

      expect(usersCountBeforeCreate.status).toBe(200);
      expect(usersCountBeforeCreate.body.items).toHaveLength(0);

      const inputData: CreateUserDto = {
        login: 'login',
        password: 'password',
        email: 'anyEmail@myMail.com',
      };

      const createUserResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(inputData);

      expect(createUserResponse.status).toBe(201);
      const user = createUserResponse.body;
      expect(user).toStrictEqual({
        id: expect.any(String),
        login: inputData.login.toLowerCase(),
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
        .get(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password);

      expect(usersCountAfterCreate.status).toBe(200);
      expect(usersCountAfterCreate.body.items).toHaveLength(1);

      expect.setState({ user: { ...user, password: inputData.password } });
    });

    it('should check the creation of a user with an existing login and email', async () => {
      // First, create a user with a specific login and email
      const existingUser: CreateUserDto = {
        login: 'user',
        email: 'user@example.com',
        password: 'password123',
      };

      const createUserResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(existingUser);

      expect(createUserResponse.status).toBe(201);

      // Now, attempt to create another user with the same login and email
      const duplicateUser: CreateUserDto = {
        login: 'user', // Same login as above
        email: 'user@example.com', // Same email as above
        password: 'password123',
      };

      const duplicateResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(duplicateUser);

      // Check that the response status is 400 (Bad Request) due to duplicate login/email
      expect(duplicateResponse.status).toBe(400);

      // Check error messages for login and email constraints
      expect(duplicateResponse.body).toEqual({
        errorsMessages: [
          {
            message: `{"LoginEmailExistsValidator":"User with '${duplicateUser.login}' already exists."}`,
            field: 'login',
          },
          {
            message: `{"LoginEmailExistsValidator":"User with '${duplicateUser.email}' already exists."}`,
            field: 'email',
          },
        ],
      });
    });

    it('should retrieve a created user by ID', async () => {
      const createUserDto: CreateUserDto = {
        login: 'createUser',
        email: 'createUser@example.com',
        password: 'password123',
      };

      // Create a new user
      const createUserResponse = await request(server)
        .post(saUrl)
        .auth(mockUserCredentials.login, mockUserCredentials.password)
        .send(createUserDto);

      expect(createUserResponse.status).toBe(201);

      const createdUser = createUserResponse.body;

      // Retrieve the user by their ID
      const retrieveUserResponse = await request(server).get(
        `/users/${createdUser.id}`,
      );
      expect(retrieveUserResponse.status).toBe(200);
      const retrievedUser: UsersEntity = retrieveUserResponse.body;

      // Validate the retrieved user's data
      expect(retrievedUser.userId).toBe(createdUser.id);
      expect(retrievedUser.login).toBe(createdUser.login.toLowerCase());
      expect(retrievedUser.email).toBe(createdUser.email.toLowerCase());
      expect(retrievedUser.createdAt).toBe(createdUser.createdAt);
      expect(retrievedUser.isBanned).toEqual(createdUser.banInfo.isBanned);
      expect(retrievedUser.banDate).toEqual(createdUser.banInfo.banDate);
      expect(retrievedUser.banReason).toEqual(createdUser.banInfo.banReason);
    });
  });
});
