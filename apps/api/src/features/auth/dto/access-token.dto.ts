import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AccessTokenDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, {
    message: 'Invalid refreshToken format. Should be a valid JWT.',
  })
  accessToken: string;
}
