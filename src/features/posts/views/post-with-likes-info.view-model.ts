import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';

export class NewestLikes {
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
  likesCount: number = 0; // Set default value
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect dislikesCount length! Must be min 1, max 50 ch.',
  })
  @IsNumber()
  dislikesCount: number = 0; // Set default value
  @IsNotEmpty()
  @Length(4, 7, {
    message: 'Incorrect myStatus length! Must be min 4, max 7 ch.',
  })
  @IsNotEmpty()
  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect myStatus must be type of Like, Dislike or None.',
  })
  myStatus: LikeStatusEnums = LikeStatusEnums.NONE; // Set default value
  newestLikes: NewestLikes[] = []; // Set default value
}

export class PostWithLikesInfoViewModel {
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
}
