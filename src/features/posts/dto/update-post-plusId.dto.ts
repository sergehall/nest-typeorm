import { IsNotEmpty, Length, Validate } from 'class-validator';
import { BlogExistsRule } from '../../../pipes/blog-exist-validation';

export class UpdatePostPlusIdDto {
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
  @Length(0, 50, {
    message: 'Incorrect id length! Must be max 50 ch.',
  })
  id: string;
}
