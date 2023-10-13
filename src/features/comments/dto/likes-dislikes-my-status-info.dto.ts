import { LikeStatusEnums } from '../../../common/enums/like-status.enums';

export type LikesDislikesMyStatusInfoDto = {
  id: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatusEnums;
};
