import { StatusLike } from '../../../config/db/mongo/enums/like-status.enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BanInfo {
  @IsNotEmpty()
  @IsBoolean({
    message: 'Incorrect isBanned length! Must be boolean.',
  })
  isBanned: boolean;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  banDate: string | null;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect banReason length! Must be min 20 max 300 ch.',
  })
  banReason: string | null;
}
class PostInfo {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect title length! Must be max 100 ch.',
  })
  title: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogId! Must be max 15 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 15, {
    message: 'Incorrect length! Must be max 15 ch.',
  })
  blogName: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogOwnerId! Must be max 15 ch.',
  })
  blogOwnerId: string;
}

class CommentatorInfo {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect userId! Must be max 15 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  userLogin: string;
  @IsBoolean()
  isBanned: boolean;
}

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
  myStatus: StatusLike;
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
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  postInfo: PostInfo;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
  banInfo: BanInfo;
}
