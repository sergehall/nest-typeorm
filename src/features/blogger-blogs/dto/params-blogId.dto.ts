import { IsNotEmpty, Length } from 'class-validator';

export class ParamsBlogIdDto {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect blogId length! Must be max 100 ch.',
  })
  blogId: string;
}
