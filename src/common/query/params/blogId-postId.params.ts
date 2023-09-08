import { IsNotEmpty, Validate } from 'class-validator';
import { BlogExistsValidator } from '../../validators/blog-exists.validator';
import { PostExistValidator } from '../../validators/post-exist.validator';

export class BlogIdPostIdParams {
  @IsNotEmpty()
  @Validate(BlogExistsValidator)
  blogId: string;
  @IsNotEmpty()
  @Validate(PostExistValidator)
  postId: string;
}
