import { IsNotEmpty, Length } from 'class-validator';

export class CodeDto {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect code length! Must be max 50 ch.',
  })
  code: string;
}
