import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';

export type LikeStatusPostsCountLikesDislikes = {
  likeStatusPosts: LikeStatusPostsEntity;
  likeCount: number;
  dislikeCount: number;
};
