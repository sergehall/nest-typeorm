import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TablesCommentsEntity {
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
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  postInfoPostId: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect title length! Must be max 100 ch.',
  })
  postInfoTitle: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogId! Must be max 15 ch.',
  })
  postInfoBlogId: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 15, {
    message: 'Incorrect length! Must be max 15 ch.',
  })
  postInfoBlogName: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogOwnerId! Must be max 15 ch.',
  })
  postInfoBlogOwnerId: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect userId! Must be max 15 ch.',
  })
  commentatorInfoUserId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  commentatorInfoUserLogin: string;
  @IsBoolean()
  commentatorInfoIsBanned: boolean;
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
