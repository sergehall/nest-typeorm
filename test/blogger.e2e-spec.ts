import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SaUserViewModel } from '../src/features/sa/views/sa-user-view-model';
import { CreateBlogsDto } from '../src/features/blogger-blogs/dto/create-blogs.dto';
import { MockBlogData } from './utilities/mock-test-data';
import { getTestAppOptions } from './utilities/get-test-app.options';
import TestUtils from './utilities/test.utils';

describe('Blogger Controller (e2e)', () => {
  const userUtils = new TestUtils(); // Create an instance of UserUtils
  let app: INestApplication;
  let server: any;
  let createdValidUser: SaUserViewModel;
  let confirmedUser: SaUserViewModel;
  let token: string;
  let mockBlogData: CreateBlogsDto;
  let createdBlogId: string;
  let bloggerUrl: string;

  // query params default values
  const searchNameTerm = 'null';
  const sortBy = 'createdAt';
  const sortDirection = 'desc';
  const pageNumber = 1;
  const pageSize = 10;

  beforeAll(async () => {
    const testAppOptions = await getTestAppOptions();
    app = testAppOptions.app;
    server = testAppOptions.server;
    createdValidUser = await userUtils.createTestUser(server);
    confirmedUser = await userUtils.createTestConfirmedUser(server);
    token = await userUtils.getAccessToken(server);
    mockBlogData = MockBlogData;
    bloggerUrl = '/blogger/blogs';
  }, 20000); // Increase the timeout to 20000 milliseconds (20 seconds)

  afterAll(async () => {
    await app.close();
  });

  describe('Blogger Endpoint (POST) /blogger/blogs', () => {
    it('should be defined', async () => {
      const response = await request(server).post(bloggerUrl);
      expect(response).toBeDefined();
    });
  });

  describe('Create Blog (POST) /blogger/blogs', () => {
    it('should create a new blog', async () => {
      // Send a POST request to create a new blog
      const response = await request(server)
        .post(bloggerUrl)
        .send(mockBlogData)
        .set('Authorization', `Bearer ${token}`); // Assuming you have a valid JWT token

      // Assert the response status code
      expect(response.status).toBe(201); // Assuming 201 is the status code for successful creation

      // Assert the response body contains the created blog data
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: mockBlogData.name,
          description: mockBlogData.description,
          websiteUrl: mockBlogData.websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
          images: {
            wallpaper: null,
            main: expect.arrayContaining([]),
          },
          currentUserSubscriptionStatus: 'None',
          subscribersCount: 0,
        }),
      );

      // Optionally, you can store the created blog ID for further testing
      createdBlogId = response.body.id;
    });

    it('should require valid blog data to create a new blog', async () => {
      // Missing required fields
      const invalidUserData = {};
      const response = await request(server)
        .post(bloggerUrl)
        .send(invalidUserData)
        .set('Authorization', `Bearer ${token}`); // Assuming you have a valid JWT token
      expect(response.status).toBe(400);
    });

    it('should require Bearer Authorization to create a new blog', async () => {
      const response = await request(server)
        .post(bloggerUrl)
        .send(mockBlogData);
      expect(response.status).toBe(401);
    });
  });

  describe('Get Blogs Owned by Current User (GET) /blogger/blogs', () => {
    it('should retrieve blogs owned by the current user', async () => {
      const response = await request(server)
        .get(bloggerUrl)
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          // Asserting the structure of the paginator response
          pagesCount: expect.any(Number),
          page: expect.any(Number),
          pageSize: expect.any(Number),
          totalCount: expect.any(Number),
          items: expect.any(Array), // Expecting items array to be present
          // If items array is present, each item should adhere to the specified structure
          ...(response.body.items.length > 0 && {
            items: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                description: expect.any(String),
                websiteUrl: expect.any(String),
                createdAt: expect.any(String),
                isMembership: expect.any(Boolean),
              }),
            ]),
          }),
        }),
      );
    });

    it('should require Bearer Authorization to Get Blogs', async () => {
      const response = await request(server).get(bloggerUrl);

      expect(response.status).toBe(401);
    });
  });

  describe('Get Comments Owned by Current User (GET) /blogger/blogs/comments', () => {
    it('should retrieve comments owned by the current user', async () => {
      // Your test logic here
    });
  });

  describe('Update Blog by ID (PUT) /blogger/blogs/:id', () => {
    it('should update a blog by its ID', async () => {
      // Your test logic here
    });
  });

  describe('Get Posts in Blog (GET) /blogger/blogs/:blogId/posts', () => {
    it('should retrieve posts within a specific blog', async () => {
      // Your test logic here
    });
  });

  describe('Create Post in Blog (POST) /blogger/blogs/:blogId/posts', () => {
    it('should create a new post within a blog', async () => {
      // Your test logic here
    });
  });

  describe('Search Banned Users in Blog (GET) /blogger/users/blog/:id', () => {
    it('should search for banned users within a blog', async () => {
      // Your test logic here
    });
  });

  describe('Update Post by Post ID (PUT) /blogger/blogs/:blogId/posts/:postId', () => {
    it('should update a post within a blog by its Post ID', async () => {
      // Your test logic here
    });
  });

  describe('Manage Blog Access (PUT) /blogger/users/:id/ban', () => {
    it('should manage access to a blog by banning/unbanning a user', async () => {
      // Your test logic here
    });
  });

  describe('Delete Post by Post ID (DELETE) /blogger/blogs/:blogId/posts/:postId', () => {
    it('should delete a post within a blog by its Post ID', async () => {
      // Your test logic here
    });
  });

  describe('Delete Blog by ID (DELETE) /blogger/blogs/:id', () => {
    it('should delete a blog by its ID', async () => {
      // Your test logic here
    });
  });

  describe('Upload Image for Post (POST) /blogger/blogs/:blogId/posts/:postId/images/main', () => {
    it('should upload an image for a post', async () => {
      // Your test logic here
    });
  });

  describe('Upload Blog Wallpaper Image (POST) /blogger/blogs/:blogId/images/wallpaper', () => {
    it('should upload a wallpaper image for a blog', async () => {
      // Your test logic here
    });
  });

  describe('Upload Main Blog Image (POST) /blogger/blogs/:blogId/images/main', () => {
    it('should upload a main image for a blog', async () => {
      // Your test logic here
    });
  });
});
