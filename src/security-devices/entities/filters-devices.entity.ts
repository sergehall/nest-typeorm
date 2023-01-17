import { IsNotEmpty, Length } from 'class-validator';

export class FiltersDevicesEntity {
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect userId! Must be max 30 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(0, 30, {
    message: 'Incorrect deviceId! Must be max 30 ch.',
  })
  deviceId: string;
}
