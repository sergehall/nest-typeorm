import { IsNotEmpty, Length } from 'class-validator';

export class CommentIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect commentId length! Must be max 100 ch.',
  })
  commentId: string;
}
