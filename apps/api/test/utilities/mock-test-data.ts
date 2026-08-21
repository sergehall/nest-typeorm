import { CreateBlogsDto } from '../../src/features/blogger-blogs/dto/create-blogs.dto';
import { CreateCommentDto } from '../../src/features/comments/dto/create-comment.dto';
import { CreatePostDto } from '../../src/features/posts/dto/create-post.dto';
import { CreateUserDto } from '../../src/features/users/dto/create-user.dto';

export const MockUserCredentials = {
  login: 'admin',
  password: 'qwerty',
} as const;

export const MockTestUser = {
  login: 'testUser',
  email: 'testUser@example.com',
  password: '123456789',
} as const satisfies CreateUserDto;

export const MockConfirmedUser = {
  login: 'confUser',
  email: 'confirmedUser@example.com',
  password: '123456789',
} as const satisfies CreateUserDto;

export const MockBlogData = {
  name: 'Test Blog',
  description: 'This is a test blog',
  websiteUrl: 'https://test-website-url.com',
} as const satisfies CreateBlogsDto;

export const MockCommentData = {
  content: 'New test comment comment comment.',
} as const satisfies CreateCommentDto;

export const MockPostData = {
  title: 'Test post',
  shortDescription: 'Test post shortDescription.',
  content:
    'But I must explain to you how all this mistaken idea of denouncing pleasure and praising.',
} as const satisfies CreatePostDto;
