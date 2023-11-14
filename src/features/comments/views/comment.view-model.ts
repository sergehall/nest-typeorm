import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';

class CommentatorInfo {
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
  userLogin: string;
}

export class LikesInfo {
  @IsNotEmpty()
  @IsNumber()
  likesCount = 0; // Set default value
  @IsNotEmpty()
  @IsNumber()
  dislikesCount = 0; // Set default value
  @IsNotEmpty()
  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect likeStatus must be type of Like, Dislike or None.',
  })
  myStatus: LikeStatusEnums = LikeStatusEnums.NONE; // Set default value
}

export class CommentViewModel {
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
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
}
