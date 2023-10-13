import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';

export class LikeStatusDto {
  @IsNotEmpty()
  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect likeStatus must be type of Like, Dislike or None.',
  })
  likeStatus: LikeStatusEnums;
}
