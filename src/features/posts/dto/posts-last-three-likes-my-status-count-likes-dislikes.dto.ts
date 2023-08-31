import { PostsEntity } from '../entities/posts.entity';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export class PostsLastThreeLikesMyStatusCountLikesDislikesDto {
  post: PostsEntity;
  lastLikes: LikeStatusPostsEntity[];
  myStatus: LikeStatusEnums;
  likesCount: number;
  dislikesCount: number;
}
