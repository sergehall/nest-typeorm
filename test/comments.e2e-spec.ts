import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SaUserViewModel } from '../src/features/sa/views/sa-user-view-model';
import { getTestAppOptions } from './utilities/get-test-app.options';
import TestUtils from './utilities/test.utils';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../src/features/blogger-blogs/views/blogger-blogs-with-images-subscribers.view-model';
import { PostWithLikesImagesInfoViewModel } from '../src/features/posts/views/post-with-likes-images-info.view-model';
import { MockCommentData } from './utilities/mock-test-data';

describe('Comments Controller (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let createdValidUser: SaUserViewModel;
  let confirmedUser: SaUserViewModel;
  let token: string;
  let blog: BloggerBlogsWithImagesSubscribersViewModel;
  let post: PostWithLikesImagesInfoViewModel;
  let commentData: { content: string };

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
    const testUtils = new TestUtils();
    createdValidUser = await testUtils.createTestUser(server);
    confirmedUser = await testUtils.createTestConfirmedUser(server);
    token = await testUtils.getAccessToken(server);
    blog = await testUtils.createBlog(server, token);
    post = await testUtils.createPost(blog.id, server, token);
    commentData = MockCommentData;
  }, 20000); // Increase the timeout to 20000 milliseconds (20 seconds)

  afterAll(async () => {
    await app.close();
  });

  describe('Comments Endpoint (POST) /comments', () => {
    it('should be defined', async () => {
      const commentsUrl = '/comments';
      const response = await request(server).post(commentsUrl);
      expect(response).toBeDefined();
    });
  });

  it('should create a new comment', async () => {
    const createCommentUrl = `/posts/${post.id}/comments`;

    const response = await request(server)
      .post(createCommentUrl)
      .send(commentData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(201);
    // Assert the response body contains the created blog data
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        content: commentData.content,
        createdAt: expect.any(String),
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      }),
    );
  });

  it('should return 401 if user is not authenticated', async () => {
    const createCommentUrl = `/posts/${post.id}/comments`;
    const response = await request(server)
      .post(createCommentUrl)
      .send(commentData);

    expect(response.status).toEqual(401);
  });

  describe('Comments Endpoint (GET) /comments/:id', () => {
    // Test cases for GET /comments/:id endpoint
  });

  describe('Comments Endpoint (PUT) /comments/:commentId', () => {
    // Test cases for PUT /comments/:commentId endpoint
  });

  describe('Comments Endpoint (DELETE) /comments/:commentId', () => {
    // Test cases for DELETE /comments/:commentId endpoint
  });

  describe('Comments Endpoint (PUT) /comments/:commentId/like-status', () => {
    // Test cases for PUT /comments/:commentId/like-status endpoint
  });
});
