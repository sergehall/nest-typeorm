import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { getTestAppOptions, resetTestDatabase } from './utilities/get-test-app.options';
import {
  getResponseBody,
  getValidationErrorFields,
  parsePaginator,
  parseTestBlog,
  parseTestPost,
} from './utilities/http-response.utils';
import { MockBlogData, MockPostData, MockTestUser } from './utilities/mock-test-data';
import TestUtils from './utilities/test.utils';

const OTHER_USER = {
  login: 'otherUser',
  email: 'other-user@example.com',
  password: '123456789',
} as const satisfies CreateUserDto;

describe('Blogger API (e2e)', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let server: Server;
  let testUtils: TestUtils;

  beforeAll(async () => {
    const testContext = await getTestAppOptions();
    app = testContext.app;
    dataSource = testContext.dataSource;
    server = testContext.server;
    testUtils = new TestUtils(server);
  });

  beforeEach(async () => {
    await resetTestDatabase(dataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  const createAuthenticatedUser = async (): Promise<string> => {
    await testUtils.createTestUser();
    return testUtils.getAccessToken(MockTestUser.login, MockTestUser.password);
  };

  it('requires authentication for blogger read and write endpoints', async () => {
    await request(server).get('/blogger/blogs').expect(401);
    await request(server).post('/blogger/blogs').send(MockBlogData).expect(401);
  });

  it('validates the blog contract before creating a blog', async () => {
    const token = await createAuthenticatedUser();
    const response = await request(server)
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(response))).toEqual(
      expect.arrayContaining(['name', 'description', 'websiteUrl']),
    );
  });

  it('supports the owner blog and post lifecycle', async () => {
    const token = await createAuthenticatedUser();
    const blog = await testUtils.createBlog(token);

    expect(blog).toMatchObject({
      ...MockBlogData,
      isMembership: false,
    });
    expect(Date.parse(blog.createdAt)).not.toBeNaN();

    const blogsResponse = await request(server)
      .get('/blogger/blogs?pageNumber=1&pageSize=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const blogs = parsePaginator(getResponseBody(blogsResponse), parseTestBlog);

    expect(blogs).toMatchObject({ page: 1, pageSize: 5, totalCount: 1 });
    expect(blogs.items).toEqual([expect.objectContaining({ id: blog.id })]);

    const updatedBlog = {
      name: 'Updated Blog',
      description: 'Updated test blog description',
      websiteUrl: 'https://updated-blog.example.com',
    };
    await request(server)
      .put(`/blogger/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedBlog)
      .expect(204);

    const updatedBlogResponse = await request(server).get(`/blogs/${blog.id}`).expect(200);
    expect(parseTestBlog(getResponseBody(updatedBlogResponse))).toMatchObject(updatedBlog);

    const post = await testUtils.createPost(blog.id, token);
    expect(post).toMatchObject({ ...MockPostData, blogId: blog.id });

    const postsResponse = await request(server)
      .get(`/blogger/blogs/${blog.id}/posts`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const posts = parsePaginator(getResponseBody(postsResponse), parseTestPost);
    expect(posts.items).toEqual([expect.objectContaining({ id: post.id })]);

    const updatedPost = {
      title: 'Updated post',
      shortDescription: 'Updated post short description.',
      content: 'Updated post content for the blogger lifecycle scenario.',
    };
    await request(server)
      .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedPost)
      .expect(204);

    const updatedPostResponse = await request(server).get(`/posts/${post.id}`).expect(200);
    expect(parseTestPost(getResponseBody(updatedPostResponse))).toMatchObject(updatedPost);

    await request(server)
      .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server).get(`/posts/${post.id}`).expect(404);

    await request(server)
      .delete(`/blogger/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server).get(`/blogs/${blog.id}`).expect(404);
  });

  it('prevents another authenticated user from modifying an owned blog', async () => {
    const ownerToken = await createAuthenticatedUser();
    const blog = await testUtils.createBlog(ownerToken);

    await testUtils.createUser(OTHER_USER);
    const otherToken = await testUtils.getAccessToken(OTHER_USER.login, OTHER_USER.password);

    await request(server)
      .put(`/blogger/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send(MockBlogData)
      .expect(403);

    await request(server)
      .delete(`/blogger/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    await request(server).get(`/blogs/${blog.id}`).expect(200);
  });
});
