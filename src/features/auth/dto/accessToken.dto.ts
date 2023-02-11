import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AccessToken {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect refreshToken length! Must be max 100 ch.',
  })
  accessToken: string;
}
