import { IsNotEmpty, Length, Matches } from 'class-validator';

export class SecurityDeviceViewModel {
  @IsNotEmpty()
  @Length(0, 20, {
    message: 'Incorrect ip! Must be max 20 ch.',
  })
  ip: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect title! Must be max 100 ch.',
  })
  title: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect lastActiveDate length! Must be max 30 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  lastActiveDate: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect deviceId! Must be max 30 ch.',
  })
  deviceId: string;
}
