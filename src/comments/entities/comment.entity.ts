import { StatusLike } from '../../infrastructure/database/enums/like-status.enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LikesInfo {
  @IsNotEmpty()
  @IsNumber()
  likesCount: number;
  @IsNotEmpty()
  @IsNumber()
  dislikesCount: number;
  @IsNotEmpty()
  @IsEnum(StatusLike, {
    message: 'Incorrect likeStatus must be type of Like, Dislike or None.',
  })
  myStatus: StatusLike.NONE;
}

export class CommentsEntity {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id length! Must be min 0, max 100 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect content length! Must be min 20, max 300 ch.',
  })
  content: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect userId length! Must be min 0, max 100 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect userLogin length! Must be min 3, max 10 ch.',
  })
  userLogin: string;
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  likesInfo: LikesInfo;
}
