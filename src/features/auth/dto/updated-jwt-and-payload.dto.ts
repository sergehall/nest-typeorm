import { IsNotEmpty, IsString, Length } from 'class-validator';
import { PayloadDto } from './payload.dto';

export class UpdatedJwtAndPayloadDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100, {
    message: 'Incorrect refreshToken length! Must be max 100 ch.',
  })
  updatedJwt: string;
  updatedPayload: PayloadDto;
}
