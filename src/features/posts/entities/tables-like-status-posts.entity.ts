import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LikeStatusEnums } from '../../../common/enums/like-status.enums';

export class TablesLikeStatusPostsEntity {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogId length! Must be min 0, max 100 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect postOwnerId length! Must be min 0, max 100 ch.',
  })
  postOwnerId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect postId length! Must be min 0, max 100 ch.',
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
  @IsBoolean()
  isBanned: boolean;
  login: string;
  @IsNotEmpty()
  @Length(4, 7, {
    message:
      'Incorrect likeStatus length! Must be min 4, max 7 ch. Type of Like, Dislike or None',
  })
  @IsEnum(LikeStatusEnums)
  likeStatus: LikeStatusEnums;
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  addedAt: string;
}
