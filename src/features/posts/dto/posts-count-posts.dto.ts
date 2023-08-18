import { ReturnPostsEntity } from '../entities/return-posts.entity';

export class PostsCountPostsDto {
  posts: ReturnPostsEntity[];
  countPosts: number;
}
