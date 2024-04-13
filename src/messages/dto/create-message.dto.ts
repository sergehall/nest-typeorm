import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(800, {
    message: 'Incorrect content length! Must be max 800 ch.',
  })
  message: string;
}
