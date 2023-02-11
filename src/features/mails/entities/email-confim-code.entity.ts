import { IsNotEmpty, Length, Matches } from 'class-validator';

export class EmailConfimCodeEntity {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect id length! Must be min 0, max 50 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 20 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect login length! Must be max 100 ch.',
  })
  confirmationCode: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect addedAt length! Must be min 1, max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
}
