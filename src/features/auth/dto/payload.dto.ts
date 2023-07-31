import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class PayloadDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Incorrect userId length! Must be max 50 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 30 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
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
