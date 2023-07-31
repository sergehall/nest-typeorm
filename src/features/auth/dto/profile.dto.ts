import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ProfileDto {
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 30 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Incorrect userId length! Must be max 50 ch.',
  })
  userId: string;
}
