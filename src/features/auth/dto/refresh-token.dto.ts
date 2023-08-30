import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect refreshToken length! Must be max 100 characters.',
  })
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, {
    message: 'Invalid refreshToken format. Should be a valid JWT.',
  })
  refreshToken: string;
}
