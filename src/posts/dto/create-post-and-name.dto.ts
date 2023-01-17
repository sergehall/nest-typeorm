import { IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { BlogExistsRule } from '../../pipes/blog-exist-validation';

export class CreatePostAndNameDto {
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect title length! Must be max 100 ch.',
  })
  title: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect shortDescription length! Must be max 100 ch.',
  })
  shortDescription: string;
  @IsNotEmpty()
  @Length(0, 1000, {
    message: 'Incorrect content length! Must be max 100 ch.',
  })
  content: string;
  @IsNotEmpty()
  @Validate(BlogExistsRule)
  @Length(0, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 15, {
    message: 'Incorrect name length! Must be max 15 ch.',
  })
  name: string;
}
