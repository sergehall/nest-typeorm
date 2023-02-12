import { IsNotEmpty, Length, Validate } from 'class-validator';
import { PostExistsRule } from '../../../pipes/post-exist-validation';

export class PostIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect postId length! Must be max 100 ch.',
  })
  @Validate(PostExistsRule)
  postId: string;
}
