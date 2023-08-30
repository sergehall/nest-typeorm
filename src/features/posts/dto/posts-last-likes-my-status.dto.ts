import { ReturnPostsEntity } from '../entities/return-posts.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export class PostsLastLikesMyStatusDto {
  posts: ReturnPostsEntity[];
  lastLikes: number;
  myStatus: LikeStatusEnums;
}
