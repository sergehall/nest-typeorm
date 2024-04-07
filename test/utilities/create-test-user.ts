import { SaUserViewModel } from '../../src/features/sa/views/sa-user-view-model';
import { CreateUserDto } from '../../src/features/users/dto/create-user.dto';
import * as request from 'supertest';
import { SaDto } from './sa.dto';
import { UsersEntity } from '../../src/features/users/entities/users.entity';

export class TestUserUtils {
  constructor() {}

  async createTestUser(server: any): Promise<SaUserViewModel> {
    const createUserDto: CreateUserDto = {
      login: 'testUser',
      email: 'testUser@example.com',
      password: '123456789',
    };

    return await this.createUser(createUserDto, server);
  }

  async createTestConfirmedUser(server: any): Promise<SaUserViewModel> {
    const createUserDto: CreateUserDto = {
      login: 'confUser',
      email: 'confirmedUser@example.com',
      password: '123456789',
    };

    const createdUser: SaUserViewModel = await this.createUser(
      createUserDto,
      server,
    );
    await this.confirmUserRegistration(createUserDto.email, server);

    return createdUser;
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
