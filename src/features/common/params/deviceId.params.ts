import { IsNotEmpty, Length } from 'class-validator';

export class DeviceIdParams {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect deviceId length! Must be max 100 ch.',
  })
  deviceId: string;
}
