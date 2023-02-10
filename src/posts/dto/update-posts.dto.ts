import { IsNotEmpty, Length } from 'class-validator';

export class UpdatePostsDto {
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect title length! Must be max 30 ch.',
  })
  title: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect shortDescription length! Must be max 100 ch.',
  })
  shortDescription: string;
  @IsNotEmpty()
  @Length(0, 1000, {
    message: 'Incorrect content length! Must be max 1000 ch.',
  })
  content: string;
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect blogId length! Must be max 50 ch.',
  })
  blogId: string;
}
