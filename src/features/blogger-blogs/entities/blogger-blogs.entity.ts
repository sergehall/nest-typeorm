import { IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';

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
export class BlogOwnerInfo {
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
export class BloggerBlogsEntity {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(0, 15, {
    message: 'Incorrect name! Must be max 15 ch.',
  })
  name: string;
  @IsNotEmpty()
  @Length(0, 500, {
    message: 'Incorrect description! Must be max 500 ch.',
  })
  description: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect websiteUrl length! Must be max 100 ch.',
  })
  @Matches(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  websiteUrl: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  @IsNotEmpty()
  @IsBoolean()
  isMembership: boolean;
  @IsNotEmpty()
  blogOwnerInfo: BlogOwnerInfo;
  @IsNotEmpty()
  banInfo: BanInfo;
}
