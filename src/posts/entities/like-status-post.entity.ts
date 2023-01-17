import {
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StatusLike } from '../../infrastructure/database/enums/like-status.enums';

export class LikeStatusPostEntity {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect commentId length! Must be min 0, max 100 ch.',
  })
  postId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect userId length! Must be min 0, max 100 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @IsNotEmpty()
  @Length(4, 7, {
    message:
      'Incorrect likeStatus length! Must be min 4, max 7 ch. Type of Like, Dislike or None',
  })
  @IsEnum(StatusLike)
  likeStatus: StatusLike;
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  addedAt: string;
}
