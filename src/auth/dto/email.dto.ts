import { IsNotEmpty, Length, Matches } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @Length(6, 30, {
    message: 'Incorrect email length! Must be min 6, max 30 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}
