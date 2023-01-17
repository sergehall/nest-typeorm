import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect content length! Must be min 20, max 300 ch.',
  })
  content: string;
}
