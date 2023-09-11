import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export type CommentsLikesInfoDto = {
  commentId: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatusEnums;
};
