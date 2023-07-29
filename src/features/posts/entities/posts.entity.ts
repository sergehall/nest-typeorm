import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { StatusLike } from '../../../config/db/mongo/enums/like-status.enums';

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

class PostOwnerInfo {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
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

class NewestLikes {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect userId length! Must be min 1, max 100 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect login length! Must be min 1, max 100 ch.',
  })
  login: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect addedAt length! Must be min 1, max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  addedAt: string;
}

export class ExtendedLikesInfo {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect likesCount length! Must be min 1, max 50 ch.',
  })
  @IsNumber()
  likesCount: number;
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect dislikesCount length! Must be min 1, max 50 ch.',
  })
  @IsNumber()
  dislikesCount: number;
  @IsNotEmpty()
  @Length(4, 7, {
    message: 'Incorrect myStatus length! Must be min 4, max 7 ch.',
  })
  myStatus: StatusLike;
  newestLikes: NewestLikes[];
}

export class PostsEntity {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect id length! Must be min 1, max 100 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect title length! Must be min 0, max 30 ch.',
  })
  title: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect shortDescription length! Must be min 0, max 100 ch.',
  })
  shortDescription: string;
  @IsNotEmpty()
  @Length(0, 1000, {
    message: 'Incorrect content length! Must be min 0, max 1000 ch.',
  })
  content: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogName length! Must be min 0, max 100 ch.',
  })
  blogName: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be min 0, max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
  postOwnerInfo: PostOwnerInfo;
  banInfo: BanInfo;
}
