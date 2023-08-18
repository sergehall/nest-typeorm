import { ReturnBloggerBlogsEntity } from '../entities/return-blogger-blogs.entity';

export class BlogsCountBlogsDto {
  blogs: ReturnBloggerBlogsEntity[];
  countBlogs: number;
}
