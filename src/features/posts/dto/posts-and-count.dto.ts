import { PostWithLikesInfoViewModel } from '../views/post-with-likes-info.view-model';
import { IsArray, IsNumber } from 'class-validator';

export class PostsAndCountDto {
  @IsArray()
  posts: PostWithLikesInfoViewModel[];
  @IsNumber()
  countPosts: number;
}
