import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect refreshToken length! Must be max 100 ch.',
  })
  refreshToken: string;
}
