import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

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

export class BlogsOwnerDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 15, {
    message: 'Incorrect length! Must be max 15 ch.',
  })
  name: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 500, {
    message: 'Incorrect length! Must be max 500 ch.',
  })
  description: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect websiteUrl length! Must be max 100 ch.',
  })
  @Matches(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  websiteUrl: string;
  blogOwnerInfo: BlogOwnerInfo;
}
