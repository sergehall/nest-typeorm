import { IsNotEmpty, Length } from 'class-validator';

export class BlogIdPostIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect postId length! Must be max 100 ch.',
  })
  postId: string;
}
