import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export type LikesDislikesMyStatusInfoDto = {
  id: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatusEnums;
};
