import { SaUserViewModel } from '../../src/features/sa/views/sa-user-view-model';
import { CreateUserDto } from '../../src/features/users/dto/create-user.dto';
import * as request from 'supertest';
import {
  MockBlogData,
  MockConfirmedUser,
  MockPostData,
  MockTestUser,
  MockUserCredentials,
} from './mock-test-data';
import { UsersEntity } from '../../src/features/users/entities/users.entity';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../../src/features/blogger-blogs/views/blogger-blogs-with-images-subscribers.view-model';
import { PostWithLikesImagesInfoViewModel } from '../../src/features/posts/views/post-with-likes-images-info.view-model';

export class TestUtils {
  private readonly testUser: CreateUserDto;
  private readonly confirmedUser: CreateUserDto;

  constructor() {
    this.testUser = MockTestUser;
    this.confirmedUser = MockConfirmedUser;
  }

  async createBlog(
    server: any,
    token: string,
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel> {
    const response = await request(server)
      .post('/blogger/blogs')
      .send(MockBlogData)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    return response.body;
  }

  async createPost(
    blogId: string,
    server: any,
    token: string,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const createPostUrl = `/blogger/blogs/${blogId}/posts`;
    const response = await request(server)
      .post(createPostUrl)
      .send(MockPostData)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    return response.body;
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
      .auth(MockUserCredentials.login, MockUserCredentials.password)
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
      .auth(MockUserCredentials.login, MockUserCredentials.password);

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

export default TestUtils;
