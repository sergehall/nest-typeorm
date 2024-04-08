import { CreateBlogsDto } from '../../src/features/blogger-blogs/dto/create-blogs.dto';
import { CreatePostDto } from '../../src/features/posts/dto/create-post.dto';

export const MockUserCredentials = {
  login: 'admin',
  password: 'qwerty',
};

export const MockTestUser = {
  login: 'testUser',
  email: 'testUser@example.com',
  password: '123456789',
};

export const MockConfirmedUser = {
  login: 'confUser',
  email: 'confirmedUser@example.com',
  password: '123456789',
};

export const MockBlogData: CreateBlogsDto = {
  name: 'Test Blog',
  description: 'This is a test blog',
  websiteUrl: 'https://test-website-url.com',
};

export const MockCommentData: { content: string } = {
  content: 'New test comment comment comment.',
};

export const MockPostData: CreatePostDto = {
  title: 'Test post',
  shortDescription: 'Test post shortDescription.',
  content:
    'But I must explain to you how all this mistaken idea of denouncing pleasure and praising.',
};
