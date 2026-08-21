import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { LikeStatusEnums } from '../src/db/enums/like-status.enums';
import { CreateUserDto } from '../src/features/users/dto/create-user.dto';
import { getTestAppOptions, resetTestDatabase } from './utilities/get-test-app.options';
import {
  getResponseBody,
  getValidationErrorFields,
  parseTestComment,
} from './utilities/http-response.utils';
import { MockCommentData, MockTestUser } from './utilities/mock-test-data';
import TestUtils from './utilities/test.utils';

const OTHER_COMMENTER = {
  login: 'commenter',
  email: 'commenter@example.com',
  password: '123456789',
} as const satisfies CreateUserDto;

describe('Comments API (e2e)', () => {
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

  const createCommentPrerequisites = async () => {
    await testUtils.createTestUser();
    const token = await testUtils.getAccessToken(MockTestUser.login, MockTestUser.password);
    const blog = await testUtils.createBlog(token);
    const post = await testUtils.createPost(blog.id, token);
    return { blog, post, token };
  };

  it('enforces authentication and validates comment content', async () => {
    const { post, token } = await createCommentPrerequisites();
    const url = `/posts/${post.id}/comments`;

    await request(server).post(url).send(MockCommentData).expect(401);

    const response = await request(server)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'too short' })
      .expect(400);

    expect(getValidationErrorFields(getResponseBody(response))).toContain('content');
  });

  it('supports create, read, update, like, and delete behavior', async () => {
    const { post, token } = await createCommentPrerequisites();
    const comment = await testUtils.createComment(post.id, token);

    expect(comment).toMatchObject(MockCommentData);
    expect(Date.parse(comment.createdAt)).not.toBeNaN();

    const publicCommentResponse = await request(server).get(`/comments/${comment.id}`).expect(200);
    expect(parseTestComment(getResponseBody(publicCommentResponse))).toEqual(comment);
    expect(getResponseBody(publicCommentResponse)).toEqual(
      expect.objectContaining({
        commentatorInfo: expect.objectContaining({
          userId: expect.any(String),
          userLogin: MockTestUser.login.toLowerCase(),
        }),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatusEnums.NONE,
        },
      }),
    );

    const updatedContent = 'Updated comment content with enough characters.';
    await request(server)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: updatedContent })
      .expect(204);

    const updatedCommentResponse = await request(server).get(`/comments/${comment.id}`).expect(200);
    expect(parseTestComment(getResponseBody(updatedCommentResponse)).content).toBe(updatedContent);

    await request(server)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: LikeStatusEnums.LIKE })
      .expect(204);

    const likedCommentResponse = await request(server)
      .get(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getResponseBody(likedCommentResponse)).toEqual(
      expect.objectContaining({
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatusEnums.LIKE,
        },
      }),
    );

    await request(server)
      .delete(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server).get(`/comments/${comment.id}`).expect(404);
  });

  it('prevents another user from editing or deleting a comment', async () => {
    const { post, token } = await createCommentPrerequisites();
    const comment = await testUtils.createComment(post.id, token);

    await testUtils.createUser(OTHER_COMMENTER);
    const otherToken = await testUtils.getAccessToken(
      OTHER_COMMENTER.login,
      OTHER_COMMENTER.password,
    );

    await request(server)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Another user must not update this comment.' })
      .expect(403);

    await request(server)
      .delete(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    await request(server).get(`/comments/${comment.id}`).expect(200);
  });
});
