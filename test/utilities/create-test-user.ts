import { SaUserViewModel } from '../../src/features/sa/views/sa-user-view-model';
import { CreateUserDto } from '../../src/features/users/dto/create-user.dto';
import * as request from 'supertest';
import { SaDto } from './sa.dto';
import { UsersEntity } from '../../src/features/users/entities/users.entity';

export class TestUserUtils {
  private readonly testUser: CreateUserDto;
  private readonly confirmedUser: CreateUserDto;

  constructor() {
    this.testUser = {
      login: 'testUser',
      email: 'testUser@example.com',
      password: '123456789',
    };
    this.confirmedUser = {
      login: 'confUser',
      email: 'confirmedUser@example.com',
      password: '123456789',
    };
  }

  async createTestUser(server: any): Promise<SaUserViewModel> {
    const testUser: CreateUserDto = this.testUser;
    return await this.createUser(testUser, server);
  }

  async createTestConfirmedUser(server: any): Promise<SaUserViewModel> {
    const confirmedUser: CreateUserDto = this.confirmedUser;

    const createdUser: SaUserViewModel = await this.createUser(
      confirmedUser,
      server,
    );
    await this.confirmUserRegistration(confirmedUser.email, server);

    return createdUser;
  }

  async getAccessToken(server: any): Promise<string> {
    // Send a request to the authentication endpoint to obtain an access token
    const response = await request(server).post('/auth/login').send({
      loginOrEmail: this.testUser.login.toLowerCase(),
      password: this.testUser.password,
    });
    // Assert the response status is 200
    expect(response.status).toBe(200);

    // Assert the response body contains an access token
    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');

    return response.body.accessToken;
  }

  private async createUser(
    createUserDto: CreateUserDto,
    server: any,
  ): Promise<SaUserViewModel> {
    const saCreateUserUrl = '/sa/users';
    const createUserResponse = await request(server)
      .post(saCreateUserUrl)
      .auth(SaDto.login, SaDto.password)
      .send(createUserDto);

    expect(createUserResponse.status).toBe(201);

    return createUserResponse.body;
  }

  private async confirmUserRegistration(
    email: string,
    server: any,
  ): Promise<void> {
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
}

export default TestUserUtils;
