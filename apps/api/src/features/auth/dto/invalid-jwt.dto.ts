import { IsNotEmpty, IsString, Length } from 'class-validator';

export class InvalidJwtDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, {
    message: 'Incorrect refreshToken length! Must be max 100 ch.',
  })
  refreshToken: string;
  @IsNotEmpty()
  @IsString()
  @Length(0, 50, {
    message: 'Incorrect expirationDate length! Must be max 50 ch.',
  })
  expirationDate: string;
}
