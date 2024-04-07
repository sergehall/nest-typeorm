import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestAppOptions } from './utilities/get-test-app-options-db';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { SaDto } from './utilities/sa.dto';
import { SaUserViewModel } from '../src/features/sa/views/sa-user-view-model';
import { UsersEntity } from '../src/features/users/entities/users.entity';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let createdValidUser: SaUserViewModel;
  let confirmedUser: SaUserViewModel;

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
    createdValidUser = await createTestUser();
    confirmedUser = await createTestConfirmedUser();
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

  describe('Resending email Endpoint (POST)', () => {
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

  describe('Login Endpoint (POST) /auth/login', () => {
    it('should successfully log in and return an access token', async () => {
      const loginData = {
        loginOrEmail: createdValidUser.login,
        password: '123456789',
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        loginOrEmail: createdValidUser.login,
        password: 'invalidPassword',
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.accessToken).toBeUndefined();
    });
  });

  async function createTestUser(): Promise<SaUserViewModel> {
    const createUserDto: CreateUserDto = {
      login: 'testUser',
      email: 'testUser@example.com',
      password: '123456789',
    };

    return await createUser(createUserDto);
  }

  async function createTestConfirmedUser(): Promise<SaUserViewModel> {
    const createUserDto: CreateUserDto = {
      login: 'confUser',
      email: 'confirmedUser@example.com',
      password: '123456789',
    };

    const createdUser: SaUserViewModel = await createUser(createUserDto);
    await confirmUserRegistration(createUserDto.email);

    return createdUser;
  }

  async function createUser(
    createUserDto: CreateUserDto,
  ): Promise<SaUserViewModel> {
    const saCreateUserUrl = '/sa/users';
    const createUserResponse = await request(server)
      .post(saCreateUserUrl)
      .auth(SaDto.login, SaDto.password)
      .send(createUserDto);

    expect(createUserResponse.status).toBe(201);

    return createUserResponse.body;
  }

  async function confirmUserRegistration(email: string): Promise<void> {
    const getUsersResponse = await request(server)
      .get('/users')
      .auth(SaDto.login, SaDto.password);

    const users: UsersEntity[] = getUsersResponse.body.items;
    const createdUser: UsersEntity | undefined = users.find(
      (user: UsersEntity) => user.email === email.toLowerCase(),
    );

    expect(users.length).toBeGreaterThan(0);
    expect(createdUser).toBeDefined();

    if (createdUser) {
      const confirmationResponse = await request(server)
        .post('/auth/registration-confirmation')
        .send({ code: createdUser.confirmationCode });

      expect(confirmationResponse.status).toBe(204);
    }
  }
});
