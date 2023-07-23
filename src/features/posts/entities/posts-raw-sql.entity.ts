import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class PostsRawSqlEntity {
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
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  postOwnerId: string;
  @IsBoolean()
  dependencyIsBanned: boolean;
  @IsNotEmpty()
  @IsBoolean({
    message: 'Incorrect isBanned length! Must be boolean.',
  })
  banInfoIsBanned: boolean;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  banInfoBanDate: string | null;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect banReason length! Must be min 20 max 300 ch.',
  })
  banInfoBanReason: string | null;
}
