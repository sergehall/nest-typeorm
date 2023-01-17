import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class PayloadDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Incorrect userId length! Must be max 50 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Incorrect deviceId length! Must be max 50 ch.',
  })
  deviceId: string;
  @IsNotEmpty()
  @IsNumber()
  @Length(0, 10, {
    message: 'Incorrect iat length! Must be max 10 ch.',
  })
  iat: number;
  @IsNotEmpty()
  @IsNumber()
  @Length(0, 10, {
    message: 'Incorrect exp length! Must be max 10 ch.',
  })
  exp: number;
}
