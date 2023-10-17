import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';

export class BlogsCountBlogsDto {
  blogs: BloggerBlogsEntity[];
  countBlogs: number;
}
