import { IsNotEmpty, Length, Matches } from 'class-validator';

export class DataForCreateUserDto {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  login: string;

  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;

  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect passwordHash length! Must be min 1, max 100 ch.',
  })
  passwordHash: string;

  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect expirationDate length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  expirationDate: string;
}
