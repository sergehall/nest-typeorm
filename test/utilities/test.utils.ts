import { CreateUserDto } from '../../src/features/users/dto/create-user.dto';
import request from 'supertest';
import {
  MockBlogData,
  MockCommentData,
  MockConfirmedUser,
  MockPostData,
  MockTestUser,
  MockUserCredentials,
} from './mock-test-data';
import { Server } from 'node:http';
import { CreateBlogsDto } from '../../src/features/blogger-blogs/dto/create-blogs.dto';
import { CreatePostDto } from '../../src/features/posts/dto/create-post.dto';
import { CreateCommentDto } from '../../src/features/comments/dto/create-comment.dto';
import {
  getResponseBody,
  parseAccessToken,
  parsePaginator,
  parseTestBlog,
  parseTestComment,
  parseTestPost,
  parseTestUser,
  parseTestUserRecord,
  TestBlog,
  TestComment,
  TestPost,
  TestUser,
} from './http-response.utils';

export class TestUtils {
  constructor(private readonly server: Server) {}

  async createBlog(token: string, blogData: CreateBlogsDto = MockBlogData): Promise<TestBlog> {
    const response = await request(this.server)
      .post('/blogger/blogs')
      .send(blogData)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return parseTestBlog(getResponseBody(response));
  }

  async createPost(
    blogId: string,
    token: string,
    postData: CreatePostDto = MockPostData,
  ): Promise<TestPost> {
    const createPostUrl = `/blogger/blogs/${blogId}/posts`;
    const response = await request(this.server)
      .post(createPostUrl)
      .send(postData)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return parseTestPost(getResponseBody(response));
  }

  async createComment(
    postId: string,
    token: string,
    commentData: CreateCommentDto = MockCommentData,
  ): Promise<TestComment> {
    const response = await request(this.server)
      .post(`/posts/${postId}/comments`)
      .send(commentData)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return parseTestComment(getResponseBody(response));
  }

  async createTestUser(): Promise<TestUser> {
    return this.createUser(MockTestUser);
  }

  async createTestConfirmedUser(): Promise<TestUser> {
    const createdUser = await this.createUser(MockConfirmedUser);
    await this.confirmUserRegistration(MockConfirmedUser.email);

    return createdUser;
  }

  async getAccessToken(
    loginOrEmail: string = MockTestUser.login,
    password: string = MockTestUser.password,
  ): Promise<string> {
    const response = await request(this.server)
      .post('/auth/login')
      .send({ loginOrEmail: loginOrEmail.toLowerCase(), password })
      .expect(200);

    return parseAccessToken(getResponseBody(response));
  }

  async createUser(createUserDto: CreateUserDto): Promise<TestUser> {
    const saCreateUserUrl = '/sa/users';
    const createUserResponse = await request(this.server)
      .post(saCreateUserUrl)
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .send(createUserDto)
      .expect(201);

    return parseTestUser(getResponseBody(createUserResponse));
  }

  private async confirmUserRegistration(email: string): Promise<void> {
    const getUsersResponse = await request(this.server)
      .get('/users')
      .auth(MockUserCredentials.login, MockUserCredentials.password)
      .expect(200);

    const users = parsePaginator(getResponseBody(getUsersResponse), parseTestUserRecord);
    const createdUser = users.items.find((user) => user.email === email.toLowerCase());

    expect(createdUser).toBeDefined();
    if (!createdUser?.confirmationCode) {
      throw new Error(`User ${email} has no confirmation code.`);
    }

    await request(this.server)
      .post('/auth/registration-confirmation')
      .send({ code: createdUser.confirmationCode })
      .expect(204);
  }
}

export default TestUtils;
