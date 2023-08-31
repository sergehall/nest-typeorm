import { ReturnPostsEntity } from '../entities/return-posts.entity';

export class PostsAndCountDto {
  posts: ReturnPostsEntity[];
  countPosts: number;
}
