import { IsNotEmpty, Length, Validate } from 'class-validator';
import { BlogExistsValidator } from '../../../common/validators/blog-exists.validator';

export class CreatePostWithBlogIdDto {
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
  @Length(0, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  @Validate(BlogExistsValidator)
  blogId: string;
}
