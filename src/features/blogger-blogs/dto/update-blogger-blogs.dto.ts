import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UpdateBloggerBlogsDto {
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
}
