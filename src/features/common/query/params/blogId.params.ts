import { IsNotEmpty, Length, Validate } from 'class-validator';
import { BlogExistsRule } from '../../../../pipes/blog-exist-rule.validation';

export class BlogIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  @Validate(BlogExistsRule)
  blogId: string;
}
