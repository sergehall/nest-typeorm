import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class MailsConfirmationCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 20 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect email length! Must be max 100 ch.',
  })
  confirmationCode: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be min 0, max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
}
