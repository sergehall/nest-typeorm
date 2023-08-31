import { PostsEntity } from '../entities/posts.entity';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { NewestLikes } from '../entities/return-posts.entity';

export class PostsLastThreeLikesMyStatusCountLikesDislikesDto {
  post: PostsEntity;
  lastLikes: LikeStatusPostsEntity[];
  myStatus: LikeStatusEnums;
  likesCount: number;
  dislikesCount: number;
}

export class PostsLastThreeLikesMyStatusCountLikesDislikesDto2 {
  post: PostsEntity;
  lastLikes: NewestLikes[];
  myStatus: LikeStatusEnums;
  likesCount: number;
  dislikesCount: number;
}
