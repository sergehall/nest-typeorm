import { IsNotEmpty, Length } from 'class-validator';

export class PostIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect postId length! Must be max 100 ch.',
  })
  postId: string;
}
