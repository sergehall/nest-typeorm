import { IsNotEmpty, Length } from 'class-validator';

export class BlogIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  blogId: string;
}
