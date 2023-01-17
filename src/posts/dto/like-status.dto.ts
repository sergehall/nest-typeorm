import { StatusLike } from '../../infrastructure/database/enums/like-status.enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class LikeStatusDto {
  @IsNotEmpty()
  @IsEnum(StatusLike, {
    message: 'Incorrect likeStatus must be type of Like, Dislike or None.',
  })
  likeStatus: StatusLike;
}
