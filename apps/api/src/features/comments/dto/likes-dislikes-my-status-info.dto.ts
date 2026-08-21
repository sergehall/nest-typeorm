import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { IsEnum, IsString } from 'class-validator';

export class LikesDislikesMyStatusInfoDto {
  @IsString()
  id: string;

  @IsString()
  likesCount: string;

  @IsString()
  dislikesCount: string;

  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect myStatus must be type of Like, Dislike or None.',
  })
  myStatus: LikeStatusEnums;
}
