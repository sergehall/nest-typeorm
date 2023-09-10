import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export type LikeStatusPostInfo = {
  postId: string;
  likeStatusPostEntity: LikeStatusPostsEntity[];
  likeCount: number;
  dislikeCount: number;
  myStatus: LikeStatusEnums;
};
